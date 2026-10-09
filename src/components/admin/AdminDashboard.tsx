import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  Settings,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Save,
  MessageSquare,
  Upload,
  Image as ImageIcon,
  Check,
  LogOut,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  Users,
  Printer,
  Receipt,
  ShieldCheck,
  Calendar,
  User,
  Download,
  Loader2,
  Copy,
  Smartphone,
  Building2,
  PhoneCall,
  MessageSquareQuote,
  CheckCheck,
  Eye,
  FileText,
  FileSpreadsheet,
  BadgePercent,
  Menu,
  Sparkles,
  Shield,
  Palette,
  BarChart3,
  Filter,
  X,
  RefreshCw,
  AlertTriangle,
  Sliders,
  Minus,
  CheckSquare,
  Square
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ProductItem, FormSubmission, ColorTheme } from '../../types/website';
import { AdminOrder, AdminTab, CategoryNavItem, OrderStatus, StoreSettings } from '../../types/admin';
import { DEFAULT_CATEGORY_NAV_ITEMS } from '../site/CategoryNavBar';
import { formatOrderDateTime } from '../../utils/date';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { SalesOverviewSection } from './SalesOverviewSection';
import { LowStockAlertModal } from './LowStockAlertModal';
import { LowStockAlertBanner } from './LowStockAlertBanner';
import { getProductStockQty, getStockStatusDisplay, isProductLowStock } from '../../utils/stock';

interface AdminDashboardProps {
  products: ProductItem[];
  onUpdateProducts: (newProducts: ProductItem[]) => void;
  orders: AdminOrder[];
  archivedOrders?: AdminOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateBulkOrderStatus?: (orderIds: string[], newStatus: OrderStatus) => void;
  onUpdateOrder?: (order: AdminOrder) => void;
  onUpdateOrderDeliveryFee?: (orderId: string, newFee: number) => void;
  onDeleteOrder?: (orderId: string) => void;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  messages: FormSubmission[];
  archivedMessages?: FormSubmission[];
  onUpdateMessage?: (updatedMessage: FormSubmission) => void;
  onDeleteMessage?: (messageId: string) => void;
  onBackToStore: () => void;
  onLogout?: () => void;
  theme?: ColorTheme;
  onToggleTheme?: () => void;
  onSelectTheme?: (themeId: string) => void;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  notificationPermission?: NotificationPermission;
  onRequestNotificationPermission?: () => void;
  newOrderToast?: AdminOrder | null;
  onClearNewOrderToast?: () => void;
}

const isClothingProduct = (p: ProductItem): boolean => {
  const catEn = (p.categoryEn || '').toLowerCase();
  const catBn = (p.categoryBn || '').toLowerCase();
  const nameEn = (p.nameEn || '').toLowerCase();
  const nameBn = (p.nameBn || '').toLowerCase();
  
  return (
    catEn.includes('clothing') ||
    catEn.includes('fashion') ||
    catEn.includes('panjabi') ||
    catEn.includes('saree') ||
    catEn.includes('cloth') ||
    catEn.includes('apparel') ||
    catBn.includes('পোশাক') ||
    catBn.includes('পাঞ্জাবি') ||
    catBn.includes('শাড়ি') ||
    catBn.includes('থ্রি-পিস') ||
    catBn.includes('ফ্যাশন')
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onUpdateProducts,
  orders,
  archivedOrders = [],
  onUpdateOrderStatus,
  onUpdateBulkOrderStatus,
  onUpdateOrder,
  onUpdateOrderDeliveryFee,
  onDeleteOrder,
  settings,
  onUpdateSettings,
  messages,
  archivedMessages = [],
  onUpdateMessage,
  onDeleteMessage,
  onBackToStore,
  activeTab,
  setActiveTab,
  onLogout,
  theme,
  onToggleTheme,
  onSelectTheme,
  notificationPermission,
  onRequestNotificationPermission,
  newOrderToast,
  onClearNewOrderToast,
}) => {
  // Tab State (removed local, using props)
  const [productSubTab, setProductSubTab] = useState<'spices' | 'clothing'>('spices');
  const [heroSettingsTab, setHeroSettingsTab] = useState<'dryfruits' | 'clothing'>('dryfruits');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus | 'processing'>('all');
  const [orderAreaFilter, setOrderAreaFilter] = useState<'all' | 'dhaka' | 'outside'>('all');
  const [showSalesOverviewChart, setShowSalesOverviewChart] = useState(false);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);

  // Bulk Order Selection & Actions State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatusToApply, setBulkStatusToApply] = useState<OrderStatus>('confirmed');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('hb_admin_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as 'admin' | 'editor' | 'moderator',
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Orders passed directly from parent
  const activeOrders = orders;
  
  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'stock_out' | 'low_stock'>('all');
  const [lowStockModalOpen, setLowStockModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    nameBn: '',
    nameEn: '',
    categoryBn: 'প্রিমিয়াম বাদাম',
    categoryEn: 'Premium Nuts',
    quantity: '1',
    unit: 'KG' as 'KG' | 'GM' | 'Pcs' | 'Ltr' | string,
    originalPrice: 400, // Regular / Original Price
    price: 340, // Offer / Selling Price
    discountPercent: 15,
    descBn: '',
    descEn: '',
    rating: 5.0,
    weightOptionsStr: '২৫০ গ্রাম:180, ৫০০ গ্রাম:340, ১ কেজি:650',
    image: 'https://images.unsplash.com/photo-1536591375315-1b836890327b?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    stockStatusText: '',
    stockQuantity: 15,
    lowStockThreshold: '' as string | number,
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির সাইজ ৫ মেগাবাইট (5MB) এর কম হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setProductForm((prev) => ({ ...prev, image: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির সাইজ ৫ মেগাবাইট (5MB) এর কম হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setTempSettings((prev) => ({ ...prev, logoImage: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির সাইজ ৫ মেগাবাইট (5MB) এর কম হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setTempSettings((prev) => ({ ...prev, heroImage: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpicesImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির সাইজ ৫ মেগাবাইট (5MB) এর কম হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setTempSettings((prev) => ({ ...prev, spicesImage: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClothingImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির সাইজ ৫ মেগাবাইট (5MB) এর কম হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setTempSettings((prev) => ({ ...prev, clothingImage: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClothingHeroImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ছবির সাইজ ৫ মেগাবাইট (5MB) এর কম হতে হবে');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setTempSettings((prev) => ({
            ...prev,
            clothingHeroImage: base64,
            clothingImage: base64,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const [archivedOrderSearch, setArchivedOrderSearch] = useState('');
  const [invoiceCopies, setInvoiceCopies] = useState<1 | 2>(1);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Copy Tracking Link State
  const [copiedTrackOrderId, setCopiedTrackOrderId] = useState<string | null>(null);

  const handleCopyTrackingLink = (order: AdminOrder) => {
    const trackIdentifier = order.invoiceNumber || order.orderNumber || order.id;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const trackingUrl = `${baseUrl}?track=${encodeURIComponent(trackIdentifier)}`;

    const onCopiedSuccess = () => {
      setCopiedTrackOrderId(order.id);
      setTimeout(() => {
        setCopiedTrackOrderId(null);
      }, 2500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(trackingUrl).then(onCopiedSuccess).catch(() => {
        const input = document.createElement('input');
        input.value = trackingUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        onCopiedSuccess();
      });
    } else {
      const input = document.createElement('input');
      input.value = trackingUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      onCopiedSuccess();
    }
  };

  // Export Orders to Excel (CSV)
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportOrdersToExcel = (customList?: AdminOrder[]) => {
    const ordersToExport = customList || filteredOrders;

    if (!ordersToExport || ordersToExport.length === 0) {
      alert('এক্সপোর্ট করার জন্য কোনো অর্ডার পাওয়া যায়নি।');
      return;
    }

    try {
      setIsExportingExcel(true);

      const headers = [
        'Order / Invoice No',
        'Customer Name',
        'Phone',
        'Address',
        'Delivery Area',
        'Items',
        'Total (BDT)',
        'Status',
        'Payment Method',
        'Advance Paid',
        'Due Amount',
        'Order Notes',
        'Date & Time'
      ];

      const escapeCSV = (field: any) => {
        if (field === null || field === undefined) return '""';
        const str = String(field).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = ordersToExport.map((order) => {
        const itemsStr = (order.items || [])
          .map((i) => `${i.productName} (x${i.quantity}) - ৳${i.price * i.quantity}`)
          .join('; ');

        const areaStr = order.deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';

        return [
          escapeCSV(order.invoiceNumber || order.orderNumber),
          escapeCSV(order.customerName),
          escapeCSV(order.customerPhone),
          escapeCSV(order.customerAddress),
          escapeCSV(areaStr),
          escapeCSV(itemsStr),
          escapeCSV(order.total),
          escapeCSV(order.status),
          escapeCSV(order.paymentMethod || 'cod'),
          escapeCSV(order.advancePaid ?? (order.paymentMethod !== 'cod' ? order.total : 0)),
          escapeCSV(order.dueAmount !== undefined ? order.dueAmount : Math.max(0, order.total - (order.advancePaid ?? (order.paymentMethod !== 'cod' ? order.total : 0)))),
          escapeCSV(order.orderNotes || ''),
          escapeCSV(order.createdAt || '')
        ].join(',');
      });

      // UTF-8 BOM so Excel natively opens Bengali text properly
      const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Halal_Bazar_Orders_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export orders to CSV:', e);
      alert('অর্ডার এক্সপোর্ট করতে সমস্যা হয়েছে।');
    } finally {
      setTimeout(() => setIsExportingExcel(false), 800);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-invoice-paper');
    if (!element || !invoiceOrder) return;

    try {
      setIsDownloadingPdf(true);
      await new Promise((r) => setTimeout(r, 150));

      const imgData = await toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        fontEmbedCSS: '',
        cacheBust: false,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = imgData;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const maxPrintWidth = pageWidth - 16; // 8mm left/right margin
      const maxPrintHeight = pageHeight - 14; // 7mm top/bottom margin

      let finalWidth = maxPrintWidth;
      let finalHeight = (img.height * finalWidth) / img.width;

      // When 2 copies or any invoice, strictly fit on 1 single A4 page!
      if (finalHeight > maxPrintHeight) {
        finalHeight = maxPrintHeight;
        finalWidth = (img.width * finalHeight) / img.height;
      }

      const marginX = (pageWidth - finalWidth) / 2;
      const marginY = 7; // Always start directly at top of the A4 page

      pdf.addImage(imgData, 'JPEG', marginX, marginY, finalWidth, finalHeight, undefined, 'FAST');
      pdf.save(`Invoice-${invoiceOrder.invoiceNumber || invoiceOrder.orderNumber}${invoiceCopies === 2 ? '-Double-2Copies' : ''}.pdf`);
    } catch (err) {
      console.error('Error generating PDF with html-to-image:', err);
      // Fallback to browser print if needed
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Settings Form State
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    console.log('AdminDashboard Products:', products);
  }, [products]);

  // Customers aggregation
  const customers = React.useMemo(() => {
    const map = new Map<string, {
      name: string;
      phone: string;
      address: string;
      ordersCount: number;
      totalSpent: number;
      lastOrderDate: string;
    }>();

    activeOrders.forEach((o) => {
      const key = o.customerPhone.trim() || o.customerName.trim();
      const existing = map.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += o.total;
        existing.lastOrderDate = o.createdAt;
      } else {
        map.set(key, {
          name: o.customerName,
          phone: o.customerPhone,
          address: o.customerAddress,
          ordersCount: 1,
          totalSpent: o.total,
          lastOrderDate: o.createdAt,
        });
      }
    });

    return Array.from(map.values());
  }, [activeOrders]);

  // Calculations for Overview & Filters
  const totalRevenue = activeOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = activeOrders.filter((o) => o.status === 'pending').length;
  const confirmedOrdersCount = activeOrders.filter((o) => o.status === 'confirmed').length;
  const processingOrdersCount = activeOrders.filter((o) => o.status === 'processing').length;
  const shippedOrdersCount = activeOrders.filter((o) => o.status === 'shipped').length;
  const deliveredOrdersCount = activeOrders.filter((o) => o.status === 'delivered').length;
  const cancelledOrdersCount = activeOrders.filter((o) => o.status === 'cancelled').length;

  // Low Stock Calculation with Configurable Threshold (default 5 units)
  const currentLowStockThreshold = settings.lowStockThreshold ?? 5;
  const lowStockProductsList = products.filter((p) => {
    if (p.inStock === false) return true;
    const threshold = p.lowStockThreshold ?? currentLowStockThreshold;
    return getProductStockQty(p) <= threshold;
  });

  // Filtered Orders
  const filteredOrders = activeOrders.filter((o) => {
    // 1. Status Stage Filter
    if (orderFilter !== 'all') {
      if (o.status !== orderFilter) return false;
    }

    // 2. Delivery Area Filter
    if (orderAreaFilter !== 'all' && o.deliveryArea !== orderAreaFilter) return false;

    // 3. Search Query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
      (o.serialNo && String(o.serialNo) === q) ||
      (o.customerAddress && o.customerAddress.toLowerCase().includes(q))
    );
  });

  const filteredOrdersTotalAmount = filteredOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  // Bulk action helpers
  const isAllFilteredOrdersSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedOrderIds.includes(o.id));

  const isSomeFilteredOrdersSelected =
    filteredOrders.some((o) => selectedOrderIds.includes(o.id)) &&
    !isAllFilteredOrdersSelected;

  const handleToggleSelectAllOrders = () => {
    if (isAllFilteredOrdersSelected) {
      const filteredIdsSet = new Set(filteredOrders.map((o) => o.id));
      setSelectedOrderIds((prev) => prev.filter((id) => !filteredIdsSet.has(id)));
    } else {
      const newSelected = new Set(selectedOrderIds);
      filteredOrders.forEach((o) => newSelected.add(o.id));
      setSelectedOrderIds(Array.from(newSelected));
    }
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleApplyBulkOrderStatus = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      if (onUpdateBulkOrderStatus) {
        await onUpdateBulkOrderStatus(selectedOrderIds, bulkStatusToApply);
      } else {
        // Fallback: update sequentially using onUpdateOrderStatus
        for (const id of selectedOrderIds) {
          onUpdateOrderStatus(id, bulkStatusToApply);
        }
      }
      setSelectedOrderIds([]);
    } catch (e) {
      console.error('Failed to update bulk order status:', e);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const isClothing = isClothingProduct(p);
    const matchesTab = productSubTab === 'clothing' ? isClothing : !isClothing;
    if (!matchesTab) return false;

    if (productStockFilter === 'in_stock' && p.inStock === false) return false;
    if (productStockFilter === 'stock_out' && p.inStock !== false) return false;
    if (productStockFilter === 'low_stock' && !isProductLowStock(p, settings.lowStockThreshold ?? 5)) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nameBn.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.categoryBn.toLowerCase().includes(q) ||
      (p.stockStatusText && p.stockStatusText.toLowerCase().includes(q))
    );
  });

  const handleToggleProductStock = (productId: string, currentInStock: boolean) => {
    const newInStock = !currentInStock;
    const updated = products.map((p) => {
      if (p.id === productId) {
        const currentQty = getProductStockQty(p);
        const newQty = newInStock ? (currentQty > 0 ? currentQty : 10) : 0;
        return {
          ...p,
          inStock: newInStock,
          stockQuantity: newQty,
          stockStatusText: !newInStock ? (p.stockStatusText || 'স্টক আউট') : undefined,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleQuickRestockProduct = (productId: string, amountToAdd: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const currentQty = getProductStockQty(p);
        const newQty = currentQty + amountToAdd;
        return {
          ...p,
          stockQuantity: newQty,
          inStock: true,
          stockStatusText: undefined,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleUpdateProductStockDirectly = (productId: string, newQty: number) => {
    const qty = Math.max(0, newQty);
    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          stockQuantity: qty,
          inStock: qty > 0 ? (p.inStock !== false) : false,
          stockStatusText: qty === 0 ? (p.stockStatusText || 'স্টক আউট') : undefined,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Wholesale state & filter
  const [wholesaleFilter, setWholesaleFilter] = useState<'all' | 'new' | 'contacted' | 'quoted' | 'deal_closed' | 'general'>('all');
  const [wholesaleSearchQuery, setWholesaleSearchQuery] = useState('');
  const [selectedWholesaleItem, setSelectedWholesaleItem] = useState<FormSubmission | null>(null);

  // Wholesale inquiries aggregation
  const wholesaleInquiries = React.useMemo(() => {
    return (messages || []).filter((m) => {
      return (
        m.type === 'wholesale' ||
        m.wholesaleDetails !== undefined ||
        (m.message && (m.message.includes('পাইকারি') || m.message.includes('ডিলার') || m.message.includes('বাল্ক')))
      );
    });
  }, [messages]);

  // General customer contact messages (non-wholesale)
  const generalMessages = React.useMemo(() => {
    return (messages || []).filter((m) => {
      const isWs =
        m.type === 'wholesale' ||
        m.wholesaleDetails !== undefined ||
        (m.message && (m.message.includes('পাইকারি') || m.message.includes('ডিলার') || m.message.includes('বাল্ক')));
      return !isWs;
    });
  }, [messages]);

  const newWholesaleCount = wholesaleInquiries.filter(
    (m) => !m.wholesaleDetails?.status || m.wholesaleDetails?.status === 'new'
  ).length;
  const contactedWholesaleCount = wholesaleInquiries.filter(
    (m) => m.wholesaleDetails?.status === 'contacted'
  ).length;
  const quotedWholesaleCount = wholesaleInquiries.filter(
    (m) => m.wholesaleDetails?.status === 'quoted'
  ).length;
  const dealClosedWholesaleCount = wholesaleInquiries.filter(
    (m) => m.wholesaleDetails?.status === 'deal_closed'
  ).length;

  const filteredWholesale = React.useMemo(() => {
    const listToFilter = wholesaleFilter === 'general' ? generalMessages : wholesaleInquiries;
    return listToFilter.filter((item) => {
      const currentStatus = item.wholesaleDetails?.status || 'new';
      if (wholesaleFilter !== 'all' && wholesaleFilter !== 'general' && currentStatus !== wholesaleFilter) return false;
      if (!wholesaleSearchQuery) return true;
      const q = wholesaleSearchQuery.toLowerCase();
      const bName = (item.wholesaleDetails?.businessName || '').toLowerCase();
      const bType = (item.wholesaleDetails?.businessType || '').toLowerCase();
      const pInterest = (item.wholesaleDetails?.productInterest || '').toLowerCase();
      const district = (item.wholesaleDetails?.district || '').toLowerCase();
      const name = item.name.toLowerCase();
      const phone = (item.phone || '').toLowerCase();
      const msg = item.message.toLowerCase();
      return (
        name.includes(q) ||
        phone.includes(q) ||
        bName.includes(q) ||
        bType.includes(q) ||
        pInterest.includes(q) ||
        district.includes(q) ||
        msg.includes(q)
      );
    });
  }, [wholesaleFilter, generalMessages, wholesaleInquiries, wholesaleSearchQuery]);

  // In-App Safe Confirmation Modal State (Avoids window.confirm blocked by iframes)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'wholesale' | 'order' | 'product';
    id: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const handleExecuteDelete = () => {
    if (!deleteConfirmation) return;
    const { type, id } = deleteConfirmation;

    if (type === 'wholesale') {
      onDeleteMessage?.(id);
      if (selectedWholesaleItem?.id === id) {
        setSelectedWholesaleItem(null);
      }
    } else if (type === 'order') {
      if (id.startsWith('customer-')) {
        const key = id.replace('customer-', '');
        activeOrders
          .filter((o) => (o.customerPhone.trim() || o.customerName.trim()) === key)
          .forEach((o) => onDeleteOrder?.(o.id));
      } else {
        onDeleteOrder?.(id);
      }
      if (editingOrder?.id === id) {
        setEditingOrder(null);
      }
      if (invoiceOrder?.id === id) {
        setInvoiceOrder(null);
      }
    } else if (type === 'product') {
      handleDeleteProduct(id);
      if (editingProduct?.id === id) {
        setProductModalOpen(false);
        setEditingProduct(null);
      }
    }
    setDeleteConfirmation(null);
  };

  const handleUpdateWholesaleStatus = (
    item: FormSubmission,
    newStatus: 'new' | 'contacted' | 'quoted' | 'deal_closed' | string
  ) => {
    const updated: FormSubmission = {
      ...item,
      wholesaleDetails: {
        ...(item.wholesaleDetails || {}),
        status: newStatus as any,
      },
    };
    onUpdateMessage?.(updated);
    if (selectedWholesaleItem?.id === item.id) {
      setSelectedWholesaleItem(updated);
    }
  };

  const renderWholesaleStatusBadge = (status?: string) => {
    switch (status) {
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            <PhoneCall className="w-3 h-3 text-blue-500" />
            যোগাযোগ করা হয়েছে
          </span>
        );
      case 'quoted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
            <FileText className="w-3 h-3 text-purple-500" />
            কোটেশন প্রেরিত
          </span>
        );
      case 'deal_closed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCheck className="w-3 h-3 text-emerald-500" />
            ডিল সম্পন্ন (সফল)
          </span>
        );
      case 'new':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-500" />
            নতুন অনুসন্ধান
          </span>
        );
    }
  };

  // Handle Product Save (Add / Edit)
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    if (productSubTab === 'clothing') {
      setProductForm({
        nameBn: '',
        nameEn: '',
        categoryBn: 'পাঞ্জাবি',
        categoryEn: 'Panjabi',
        quantity: '1',
        unit: 'Pcs',
        originalPrice: 1500,
        price: 1250,
        discountPercent: 15,
        descBn: '',
        descEn: '',
        rating: 5.0,
        weightOptionsStr: 'M:1200, L:1250, XL:1300',
        image: '',
        inStock: true,
        stockStatusText: '',
        stockQuantity: 15,
        lowStockThreshold: '',
      });
    } else {
      setProductForm({
        nameBn: '',
        nameEn: '',
        categoryBn: 'প্রিমিয়াম বাদাম',
        categoryEn: 'Premium Nuts',
        quantity: '1',
        unit: 'KG',
        originalPrice: 400,
        price: 340,
        discountPercent: 15,
        descBn: '',
        descEn: '',
        rating: 5.0,
        weightOptionsStr: '২৫০ গ্রাম:180, ৫০০ গ্রাম:340, ১ কেজি:650',
        image: '',
        inStock: true,
        stockStatusText: '',
        stockQuantity: 15,
        lowStockThreshold: '',
      });
    }
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    const weightStr = prod.weightOptions
      ? prod.weightOptions.map((w) => `${w.label}:${w.price}`).join(', ')
      : '';

    const origPrice = prod.originalPrice || prod.price;
    const currentPrice = prod.price;
    const discount = origPrice > currentPrice
      ? Math.round(((origPrice - currentPrice) / origPrice) * 100)
      : (prod.discountPercent || 0);

    let unit = prod.unit || 'KG';
    let qty = prod.quantity ? String(prod.quantity) : '1';
    if (!prod.unit) {
      const name = (prod.nameBn || '').toLowerCase();
      if (name.includes('গ্রাম') || name.includes('gm')) {
        unit = 'GM';
        const match = name.match(/(\d+)\s*(গ্রাম|gm)/);
        if (match) qty = match[1];
      } else if (name.includes('কেজি') || name.includes('kg')) {
        unit = 'KG';
        const match = name.match(/(\d+)\s*(কেজি|kg)/);
        if (match) qty = match[1];
      } else if (name.includes('লিটার') || name.includes('ltr')) {
        unit = 'Ltr';
      }
    }

    setProductForm({
      nameBn: prod.nameBn,
      nameEn: prod.nameEn,
      categoryBn: prod.categoryBn,
      categoryEn: prod.categoryEn,
      quantity: qty,
      unit: unit,
      price: currentPrice,
      originalPrice: origPrice,
      discountPercent: discount,
      descBn: prod.descBn,
      descEn: prod.descEn,
      rating: prod.rating,
      weightOptionsStr: weightStr,
      image: prod.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      inStock: prod.inStock !== false,
      stockStatusText: prod.stockStatusText || '',
      stockQuantity: prod.stockQuantity !== undefined ? prod.stockQuantity : (prod.inStock === false ? 0 : 12),
      lowStockThreshold: prod.lowStockThreshold !== undefined ? prod.lowStockThreshold : '',
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.nameBn) return;

    // Parse weight options
    const weightOptions = productForm.weightOptionsStr
      .split(',')
      .map((item) => {
        const parts = item.split(':');
        if (parts.length === 2) {
          const label = parts[0].trim();
          const price = parseInt(parts[1].trim(), 10);
          if (label && !isNaN(price)) return { label, price };
        }
        return null;
      })
      .filter(Boolean) as { label: string; price: number }[];

    const finalOriginalPrice = Number(productForm.originalPrice) || Number(productForm.price);
    const finalPrice = Number(productForm.price);
    const finalDiscount = finalOriginalPrice > finalPrice
      ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100)
      : undefined;

    const parsedStockQty = Math.max(0, parseInt(String(productForm.stockQuantity), 10) || 0);
    const parsedCustomThreshold = productForm.lowStockThreshold !== '' && !isNaN(Number(productForm.lowStockThreshold))
      ? Math.max(1, Number(productForm.lowStockThreshold))
      : undefined;
    const isActuallyInStock = parsedStockQty > 0 ? (productForm.inStock !== false) : false;

    if (editingProduct) {
      // Update
      const updatedList = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              nameBn: productForm.nameBn,
              nameEn: productForm.nameEn || productForm.nameBn,
              categoryBn: productForm.categoryBn,
              categoryEn: productForm.categoryEn,
              quantity: productForm.quantity,
              unit: productForm.unit,
              price: finalPrice,
              originalPrice: finalOriginalPrice,
              discountPercent: finalDiscount,
              descBn: productForm.descBn,
              descEn: productForm.descEn,
              image: productForm.image,
              weightOptions: weightOptions.length > 0 ? weightOptions : undefined,
              inStock: isActuallyInStock,
              stockStatusText: !isActuallyInStock ? (productForm.stockStatusText.trim() || 'স্টক আউট') : undefined,
              stockQuantity: parsedStockQty,
              lowStockThreshold: parsedCustomThreshold,
            }
          : p
      );
      onUpdateProducts(updatedList);
    } else {
      // Add new
      const newProduct: ProductItem = {
        id: `prod_${Date.now()}`,
        nameBn: productForm.nameBn,
        nameEn: productForm.nameEn || productForm.nameBn,
        categoryBn: productForm.categoryBn,
        categoryEn: productForm.categoryEn,
        quantity: productForm.quantity,
        unit: productForm.unit,
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        discountPercent: finalDiscount,
        descBn: productForm.descBn,
        descEn: productForm.descEn,
        currency: '৳',
        rating: 5.0,
        reviewsCount: 1,
        image: productForm.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
        weightOptions: weightOptions.length > 0 ? weightOptions : undefined,
        inStock: isActuallyInStock,
        stockStatusText: !isActuallyInStock ? (productForm.stockStatusText.trim() || 'স্টক আউট') : undefined,
        stockQuantity: parsedStockQty,
        lowStockThreshold: parsedCustomThreshold,
      };
      onUpdateProducts([newProduct, ...products]);
    }

    setProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    onUpdateProducts(products.filter((p) => p.id !== productId));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedSlides = tempSettings.heroSlides;
    let heroImg = tempSettings.heroImage;
    if (updatedSlides && updatedSlides.length > 0) {
      if (updatedSlides[0]?.image) {
        heroImg = updatedSlides[0].image;
      }
    }

    const cleanSettings: StoreSettings = {
      ...tempSettings,
      heroImage: heroImg,
      heroSlides: updatedSlides,
      deliveryFeeDhaka: Number(tempSettings.deliveryFeeDhaka) || 0,
      deliveryFeeOutside: Number(tempSettings.deliveryFeeOutside) || 0,
    };
    onUpdateSettings(cleanSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Helper for status badge
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            পেন্ডিং (অপেক্ষমান)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
            <RefreshCw className="w-3 h-3" />
            প্রসেসিং (প্রক্রিয়াকরণ)
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            <CheckCircle className="w-3 h-3" />
            কনফার্মড
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
            <Truck className="w-3 h-3" />
            অন দ্য ওয়ে (শিপড)
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle className="w-3 h-3" />
            ডেলিভার্ড (সম্পন্ন)
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            <XCircle className="w-3 h-3" />
            বাতিল
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Admin Top Navigation Bar */}
      <header 
        className="sticky top-0 z-30 text-white border-b border-white/10 px-4 sm:px-6 h-14 flex items-center justify-between shadow-md transition-colors duration-300"
        style={{
          background: (theme?.id === 'sky-blue-cyan' || settings.primaryColor === '#0284c7' || tempSettings.primaryColor === '#0284c7')
            ? 'linear-gradient(to right, #0284c7, #0369a1, #0c4a6e)'
            : 'linear-gradient(to right, #064e3b, #065f46, #022c22)'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-emerald-100 hover:text-white text-xs font-semibold transition-colors border border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-300" />
            <span>ওয়েবসাইটে ফিরে যান</span>
          </button>



          <div className="hidden sm:flex items-center gap-2 text-xs text-white/80">
            <span>/</span>
            <span className="text-white font-bold">{settings.storeName} এডমিন কন্ট্রোল</span>
            <span>/</span>
            <span className="capitalize text-amber-300 font-medium">
              {activeTab === 'overview' && 'ড্যাশবোর্ড ও বিশ্লেষণ'}
              {activeTab === 'analytics' && 'অ্যানালিটিক্স ও সেলস রিপোর্ট'}
              {activeTab === 'orders' && 'অর্ডার ব্যবস্থাপনা'}
              {activeTab === 'products' && 'পণ্য তালিকা ও স্টক'}
              {activeTab === 'wholesale' && '🏢 পাইকারি ও ডিলার অনুসন্ধান'}
              {activeTab === 'customers' && 'গ্রাহক ডাটাবেস'}
              {activeTab.startsWith('settings') && 'স্টোর কনফিগারেশন'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Order Notification System Status & Toggle */}
          {onRequestNotificationPermission && (
            <button
              onClick={onRequestNotificationPermission}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
              }`}
              title={
                notificationPermission === 'granted'
                  ? 'রিয়েল-টাইম ব্রাউজার নোটিফিকেশন সিস্টেম সক্রিয় রয়েছে'
                  : 'নতুন অর্ডারের রিয়েল-টাইম ব্রাউজার নোটিফিকেশন সক্রিয় করতে ক্লিক করুন'
              }
            >
              {notificationPermission === 'granted' ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">নোটিফিকেশন অন</span>
                </>
              ) : (
                <>
                  <BellRing className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>নোটিফিকেশন অন করুন</span>
                </>
              )}
            </button>
          )}

          {/* Automated Low Stock Alert Indicator */}
          <button
            type="button"
            onClick={() => setLowStockModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              lowStockProductsList.length > 0
                ? 'bg-amber-500/25 text-amber-200 border-amber-400/60 hover:bg-amber-500/35 shadow-xs'
                : 'bg-white/10 text-neutral-300 border-white/10 hover:bg-white/20'
            }`}
            title={`লো-স্টক পণ্য সতর্কবার্তা (${lowStockProductsList.length}টি পণ্য থ্রেশহোল্ডের নিচে)`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${lowStockProductsList.length > 0 ? 'text-amber-300 animate-pulse' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">লো-স্টক</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              lowStockProductsList.length > 0 ? 'bg-amber-400 text-neutral-950' : 'bg-white/20 text-white'
            }`}>
              {lowStockProductsList.length}
            </span>
          </button>

          {newWholesaleCount > 0 && (
            <button
              onClick={() => setActiveTab('wholesale')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold animate-pulse"
              title="নতুন পাইকারি ক্রয়ের বার্তা"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{newWholesaleCount}টি নতুন পাইকারি</span>
            </button>
          )}

          {pendingOrdersCount > 0 && (
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold animate-pulse"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{pendingOrdersCount}টি নতুন অর্ডার</span>
            </button>
          )}

          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>লাইভ স্টোর ভিউ</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-400 text-xs font-semibold transition-colors border border-neutral-700"
              title="এডমিন লগআউট"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Real-Time New Order Toast Banner */}
      {newOrderToast && (
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white px-4 py-3 shadow-xl border-b border-emerald-400/30 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-300 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 animate-bounce">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-md inline-block mb-0.5">
                🎉 নতুন ইনকামিং অর্ডার অ্যালার্ট!
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex flex-wrap items-center gap-2">
                <span>ইনভয়েস #{newOrderToast.invoiceNumber || newOrderToast.orderNumber}</span>
                <span className="text-amber-200">|</span>
                <span>গ্রাহক: {newOrderToast.customerName} ({newOrderToast.customerPhone})</span>
                <span className="text-amber-200">|</span>
                <span className="font-mono text-amber-300">৳{newOrderToast.total.toLocaleString()}</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('orders');
                if (onClearNewOrderToast) onClearNewOrderToast();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>অর্ডার তালিকায় দেখুন</span>
            </button>
            {onClearNewOrderToast && (
              <button
                onClick={onClearNewOrderToast}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-neutral-200 p-4 space-y-6 shrink-0 flex flex-col justify-between shadow-xs">
          <div className="space-y-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-800 to-sky-800 text-amber-300 font-bold flex items-center justify-center text-lg shadow-sm border border-emerald-700/30">
                {settings.logoImage ? (
                  <img src={settings.logoImage} alt={settings.storeName} className="w-full h-full object-cover" />
                ) : (
                  <span>{settings.storeName.charAt(0)}</span>
                )}
              </div>
              <div className="truncate">
                <h2 className="text-xs font-bold text-neutral-900 tracking-tight truncate">
                  {settings.storeName}
                </h2>
                <p className="text-[10px] text-emerald-800 font-bold mt-0.5">সুপার এডমিন প্যানেল</p>
              </div>
            </div>

            <nav className="space-y-1.5 text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className={`w-4 h-4 ${activeTab === 'overview' ? 'text-amber-300' : 'text-emerald-600'}`} />
                  <span>ওভারভিউ ড্যাশবোর্ড</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-amber-300' : 'text-emerald-600'}`} />
                  <span>অ্যানালিটিক্স ও রিপোর্টস</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Charts
                </span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className={`w-4 h-4 ${activeTab === 'orders' ? 'text-amber-300' : 'text-blue-600'}`} />
                  <span>অর্ডারসমূহ</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'products'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className={`w-4 h-4 ${activeTab === 'products' ? 'text-amber-300' : 'text-purple-600'}`} />
                  <span>পণ্য ও স্টক কন্ট্রোল</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('wholesale')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'wholesale'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className={`w-4 h-4 ${activeTab === 'wholesale' ? 'text-amber-300' : 'text-amber-600'}`} />
                  <span>পাইকারি অনুসন্ধান</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {newWholesaleCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center justify-center shadow-xs">
                      {newWholesaleCount}
                    </span>
                  )}
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold">
                    {wholesaleInquiries.length}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('live_preview')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'live_preview'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Eye className={`w-4 h-4 ${activeTab === 'live_preview' ? 'text-amber-300' : 'text-sky-600'}`} />
                  <span>লাইভ প্রিভিউ</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'customers'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${activeTab === 'customers' ? 'text-amber-300' : 'text-indigo-600'}`} />
                  <span>গ্রাহক ডাটাবেস</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                  {customers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('archive')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'archive'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className={`w-4 h-4 ${activeTab === 'archive' ? 'text-amber-300' : 'text-neutral-500'}`} />
                  <span>আর্কাইভ (ডিলিট করা তথ্য)</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold">
                  {archivedOrders.length + archivedMessages.length}
                </span>
              </button>

              <div className="pt-3 pb-1 px-1 text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                ⚙️ ডায়নামিক ম্যানেজার ও সেটিংস
              </div>

              <button
                onClick={() => setActiveTab('settings_general')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'settings_general'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className={`w-4 h-4 ${activeTab === 'settings_general' ? 'text-amber-300' : 'text-rose-600'}`} />
                  <span>১. সাধারণ সেটিংস</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings_header_footer')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'settings_header_footer'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${activeTab === 'settings_header_footer' ? 'text-amber-300' : 'text-blue-600'}`} />
                  <span>২. হেডার ও ফুটার ম্যানেজার</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings_hero')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'settings_hero' || activeTab === 'settings_homepage'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className={`w-4 h-4 ${activeTab === 'settings_hero' || activeTab === 'settings_homepage' ? 'text-amber-300' : 'text-amber-600'}`} />
                  <span>৩. হিরো ব্যানার কাস্টমাইজেশন</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings_appearance')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'settings_appearance'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className={`w-4 h-4 ${activeTab === 'settings_appearance' ? 'text-amber-300' : 'text-purple-600'}`} />
                  <span>৪. থিম ও অ্যাপিয়ারেন্স</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings_seo')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'settings_seo'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Search className={`w-4 h-4 ${activeTab === 'settings_seo' ? 'text-amber-300' : 'text-amber-600'}`} />
                  <span>৫. এসইও ও স্ক্রিপ্ট সেটিংস</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings_security')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'settings_security'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className={`w-4 h-4 ${activeTab === 'settings_security' ? 'text-amber-300' : 'text-indigo-600'}`} />
                  <span>৬. সিকিউরিটি ও রোলস</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings_content_manager')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'settings_content_manager'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-700/20'
                    : 'text-neutral-700 hover:bg-emerald-50/60 hover:text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BadgePercent className={`w-4 h-4 ${activeTab === 'settings_content_manager' ? 'text-amber-300' : 'text-emerald-600'}`} />
                  <span>৭. কনটেন্ট ও কার্ড কাস্টমাইজেশন</span>
                </div>
              </button>

            </nav>
          </div>

          {/* Admin Profile & Logout Box in Sidebar */}
          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                {(currentUser?.name || tempSettings.adminName || 'সুপার এডমিন').charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-neutral-900 truncate">
                  {currentUser?.name || tempSettings.adminName || 'সুপার এডমিন'}
                </div>
                <div className="text-[10px] text-neutral-500 truncate font-mono">
                  {currentUser?.email || tempSettings.adminEmail || 'admin@halalbazarbd.com'}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট করুন</span>
              </button>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards strictly using tabular-nums */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="text-xs text-emerald-900 font-bold uppercase tracking-wider">সর্বমোট বিক্রি</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-950 mt-1.5">
                    ৳{totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <span>✨ রেভিনিউ</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="text-xs text-blue-900 font-bold uppercase tracking-wider">মোট অর্ডার সংখ্যা</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-blue-950 mt-1.5">
                    {orders.length}
                  </div>
                  <div className="text-[11px] text-blue-700 font-semibold mt-1">
                    ডেলিভার্ড: {deliveredOrdersCount}টি
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="text-xs text-amber-900 font-bold uppercase tracking-wider">পেন্ডিং অর্ডার</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1.5">
                    {pendingOrdersCount}
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-1">কনফার্মেশন প্রয়োজন</div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="text-xs text-purple-900 font-bold uppercase tracking-wider">সক্রিয় পণ্য ও স্টক</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-purple-950 mt-1.5">
                    {products.length}
                  </div>
                  <div className="text-[11px] text-purple-700 font-semibold mt-1">ড্রাই ফ্রুটস ও পোশাক আইটেম</div>
                </div>

                {/* 5th Card: Wholesale Inquiries */}
                <div
                  onClick={() => setActiveTab('wholesale')}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-yellow-50 border border-amber-300 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/15 rounded-full blur-lg pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-amber-900 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>পাইকারি অনুসন্ধান</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded group-hover:bg-amber-300 transition-colors">
                      দেখুন →
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-950 mt-1.5 flex items-center gap-2">
                    <span>{wholesaleInquiries.length}টি</span>
                    {newWholesaleCount > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                        {newWholesaleCount} নতুন
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-1">
                    দোকানদার ও বাল্ক ক্রেতা
                  </div>
                </div>
              </div>

              {/* Automated Low Stock Alert Banner */}
              <LowStockAlertBanner
                products={products}
                settings={settings}
                onOpenLowStockModal={() => setLowStockModalOpen(true)}
                onQuickRestock={handleQuickRestockProduct}
                onNavigateToProducts={() => {
                  setActiveTab('products');
                  setProductStockFilter('low_stock');
                }}
              />

              {/* Sales Overview Section with Recharts (Daily Orders & Revenue Trend over last 30 days) */}
              <SalesOverviewSection
                orders={orders}
                primaryColor={settings.primaryColor}
              />

              {/* Analytics Quick Launch Banner */}
              <div
                onClick={() => setActiveTab('analytics')}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-neutral-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-sm hover:shadow-md transition-all group border border-emerald-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black flex items-center gap-2">
                      <span>📊 বিস্তারিত ভিজ্যুয়াল অ্যানালিটিক্স ও চার্টস</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-neutral-950">
                        Interactive
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      অর্ডার ট্রেন্ড, সেরা বিক্রিত পণ্য এবং রেভিনিউ প্রবৃদ্ধি দেখতে ক্লিক করুন
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform self-end sm:self-auto shrink-0 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <span>অ্যানালিটিক্স ড্যাশবোর্ড</span>
                  <span>→</span>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900">সাম্প্রতিক রিটেইল অর্ডারসমূহ</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
                  >
                    সব অর্ডার দেখুন ({activeOrders.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3">অর্ডার নং</th>
                        <th className="py-2.5 px-3">গ্রাহক</th>
                        <th className="py-2.5 px-3">মোবাইল</th>
                        <th className="py-2.5 px-3">পণ্য তালিকা</th>
                        <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {activeOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-neutral-800">
                            #{order.invoiceNumber || order.orderNumber}
                          </td>
                          <td className="py-3 px-3 font-medium text-neutral-900">
                            {order.customerName}
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-600">
                            {order.customerPhone}
                          </td>
                          <td className="py-3 px-3 text-neutral-600 max-w-xs truncate">
                            {order.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')}
                          </td>
                          <td className="py-3 px-3 font-mono tabular-nums font-bold text-neutral-900 text-right">
                            ৳{order.total.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">{renderStatusBadge(order.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Wholesale Leads Overview */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <h3 className="text-sm font-bold text-neutral-900">
                      সাম্প্রতিক পাইকারি ও ডিলার অনুসন্ধান ({wholesaleInquiries.length}টি)
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('wholesale')}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
                  >
                    সকল পাইকারি রিকোয়েস্ট পরিচালনা করুন ({wholesaleInquiries.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3">প্রতিষ্ঠান ও ধরন</th>
                        <th className="py-2.5 px-3">যোগাযোগকারী</th>
                        <th className="py-2.5 px-3">মোবাইল নম্বর</th>
                        <th className="py-2.5 px-3">আগ্রহী পণ্য ও পরিমাণ</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                        <th className="py-2.5 px-3 text-center">একশনে যান</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {wholesaleInquiries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-500">
                            কোনো পাইকারি অনুসন্ধান এখনও আসেনি।
                          </td>
                        </tr>
                      ) : (
                        wholesaleInquiries.slice(0, 4).map((item) => {
                          const w = item.wholesaleDetails || {};
                          return (
                            <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                              <td className="py-3 px-3">
                                <div className="font-bold text-neutral-900">
                                  {w.businessName || 'ব্যক্তিগত ব্যবসা'}
                                </div>
                                <div className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded inline-block mt-0.5 border border-amber-200">
                                  {w.businessType || 'দোকানদার'}
                                </div>
                              </td>
                              <td className="py-3 px-3 font-medium text-neutral-900">
                                {item.name}
                              </td>
                              <td className="py-3 px-3 font-mono">
                                <a href={`tel:${item.phone}`} className="text-emerald-800 font-semibold hover:underline">
                                  {item.phone || '-'}
                                </a>
                              </td>
                              <td className="py-3 px-3 text-neutral-700">
                                <div>{w.productInterest || 'ড্রাই ফ্রুটস / পোশাক'}</div>
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  পরিমাণ: {w.estimatedQuantity || 'আলোচনা সাপেক্ষে'}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                {renderWholesaleStatusBadge(w.status)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedWholesaleItem(item)}
                                    className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                                  >
                                    বিস্তারিত
                                  </button>
                                  {onDeleteMessage && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeleteConfirmation({
                                          type: 'wholesale',
                                          id: item.id,
                                          title: item.wholesaleDetails?.businessName || item.name,
                                          subtitle: `মোবাইল: ${item.phone || '-'} | পণ্য: ${item.wholesaleDetails?.productInterest || 'খাঁটি পণ্য'}`
                                        });
                                      }}
                                      className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="এই অনুসন্ধানের বিবরণ ডিলিট করুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS (D3 / RECHARTS VISUALIZATIONS) */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              orders={orders}
              products={products}
              themePrimaryColor={settings.primaryColor}
              onNavigateToTab={setActiveTab}
            />
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">গ্রাহকদের অর্ডার ফিল্টার ও তালিকা</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    স্ট্যাটাস অনুযায়ী পেন্ডিং, প্রসেসিং, ডেলিভার্ড ও বাতিল অর্ডার আলাদাভাবে ফিল্টার করে দেখুন
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSalesOverviewChart((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-2xs active:scale-95 ${
                      showSalesOverviewChart
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                    title="গত ৩০ দিনের সেলস ট্রেন্ড এবং দৈনিক অর্ডারের Recharts ভিজ্যুয়ালাইজেশন প্রদর্শন করুন"
                  >
                    <TrendingUp className={`w-4 h-4 ${showSalesOverviewChart ? 'text-emerald-600' : 'text-neutral-500'}`} />
                    <span>{showSalesOverviewChart ? 'সেলস চার্ট লুকান' : '৩০ দিনের সেলস ট্রেন্ড'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportOrdersToExcel(filteredOrders)}
                    disabled={isExportingExcel || filteredOrders.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="গ্রাহকের নাম, মোবাইল, ঠিকানা, পণ্য ও মোট টাকার হিসাব Excel / CSV ফাইলে ডাউনলোড করুন"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                    <span>{isExportingExcel ? 'ডাউনলোড হচ্ছে...' : 'Export to Excel (CSV)'}</span>
                  </button>
                </div>
              </div>

              {/* 30-Day Sales Overview Chart Section (when toggled open in Orders Tab) */}
              {showSalesOverviewChart && (
                <div className="animate-in fade-in duration-200">
                  <SalesOverviewSection
                    orders={orders}
                    primaryColor={settings.primaryColor}
                  />
                </div>
              )}

              {/* Comprehensive Order Filter Component */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-3.5 sm:p-4 shadow-2xs space-y-3.5">
                {/* 1. Filter Header Tabs for All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {/* All Orders Button */}
                  <button
                    type="button"
                    onClick={() => setOrderFilter('all')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === 'all'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs ring-2 ring-neutral-900/20'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">সব অর্ডার</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      orderFilter === 'all' ? 'bg-neutral-800 text-amber-300' : 'bg-neutral-200 text-neutral-800'
                    }`}>
                      {activeOrders.length}
                    </span>
                  </button>

                  {/* Pending Filter Button */}
                  <button
                    type="button"
                    onClick={() => setOrderFilter('pending')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === 'pending'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-500/20'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-4 h-4 text-amber-100 shrink-0" />
                      <span className="truncate">পেন্ডিং</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      orderFilter === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-200/80 text-amber-950'
                    }`}>
                      {pendingOrdersCount}
                    </span>
                  </button>

                  {/* Confirmed Filter Button */}
                  <button
                    type="button"
                    onClick={() => setOrderFilter('confirmed')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === 'confirmed'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-600/20'
                        : 'bg-blue-50/80 border-blue-200 text-blue-900 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck className="w-4 h-4 text-blue-100 shrink-0" />
                      <span className="truncate">কনফার্মড</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      orderFilter === 'confirmed' ? 'bg-blue-800 text-white' : 'bg-blue-200/80 text-blue-950'
                    }`}>
                      {confirmedOrdersCount}
                    </span>
                  </button>

                  {/* Processing Filter Button */}
                  <button
                    type="button"
                    onClick={() => setOrderFilter('processing')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === 'processing'
                        ? 'bg-sky-600 text-white border-sky-700 shadow-xs ring-2 ring-sky-600/20'
                        : 'bg-sky-50/80 border-sky-200 text-sky-900 hover:bg-sky-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <RefreshCw className="w-4 h-4 text-sky-200 shrink-0" />
                      <span className="truncate">প্রসেসিং</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      orderFilter === 'processing' ? 'bg-sky-800 text-white' : 'bg-sky-200/80 text-sky-950'
                    }`}>
                      {processingOrdersCount}
                    </span>
                  </button>

                  {/* Shipped Filter Button */}
                  <button
                    type="button"
                    onClick={() => setOrderFilter('shipped')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === 'shipped'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs ring-2 ring-purple-600/20'
                        : 'bg-purple-50/80 border-purple-200 text-purple-900 hover:bg-purple-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Truck className="w-4 h-4 text-purple-200 shrink-0" />
                      <span className="truncate">অন দ্য ওয়ে</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      orderFilter === 'shipped' ? 'bg-purple-800 text-white' : 'bg-purple-200/80 text-purple-950'
                    }`}>
                      {shippedOrdersCount}
                    </span>
                  </button>

                  {/* Delivered Filter Button */}
                  <button
                    type="button"
                    onClick={() => setOrderFilter('delivered')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === 'delivered'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-600/20'
                        : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
                      <span className="truncate">ডেলিভার্ড</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      orderFilter === 'delivered' ? 'bg-emerald-800 text-white' : 'bg-emerald-200/80 text-emerald-950'
                    }`}>
                      {deliveredOrdersCount}
                    </span>
                  </button>

                  {/* Cancelled Filter Button */}
                  <button
                    type="button"
                    onClick={() => setOrderFilter('cancelled')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                      orderFilter === 'cancelled'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-600/20'
                        : 'bg-rose-50/80 border-rose-200 text-rose-900 hover:bg-rose-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <XCircle className="w-4 h-4 text-rose-200 shrink-0" />
                      <span className="truncate">বাতিল</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      orderFilter === 'cancelled' ? 'bg-rose-800 text-white' : 'bg-rose-200/80 text-rose-950'
                    }`}>
                      {cancelledOrdersCount}
                    </span>
                  </button>
                </div>

                {/* 2. Controls & Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-neutral-100">
                  <div className="flex items-center gap-2 flex-1 max-w-xl">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="নাম, মোবাইল, ইনভয়েস বা ঠিকানা লিখে খুঁজুন..."
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-medium placeholder:text-neutral-400"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Area Filter Select */}
                    <select
                      value={orderAreaFilter}
                      onChange={(e) => setOrderAreaFilter(e.target.value as any)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-neutral-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer text-neutral-700 shrink-0"
                    >
                      <option value="all">📍 সব এলাকা</option>
                      <option value="dhaka">🏙️ ঢাকার ভেতরে</option>
                      <option value="outside">🚛 ঢাকার বাইরে</option>
                    </select>

                    {/* Status / Stage Filter Select */}
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value as any)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-neutral-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer text-neutral-700 shrink-0"
                      title="অর্ডারের স্টেজ বা বর্তমান অবস্থা অনুযায়ী ফিল্টার করুন"
                    >
                      <option value="all">⚡ সকল স্ট্যাটাস ({activeOrders.length})</option>
                      <option value="pending">⏳ পেন্ডিং / Pending ({pendingOrdersCount})</option>
                      <option value="confirmed">✅ কনফার্মড / Confirmed ({confirmedOrdersCount})</option>
                      <option value="processing">⚙️ প্রসেসিং / Processing ({processingOrdersCount})</option>
                      <option value="shipped">🚚 অন দ্য ওয়ে / Shipped ({shippedOrdersCount})</option>
                      <option value="delivered">📦 ডেলিভার্ড / Delivered ({deliveredOrdersCount})</option>
                      <option value="cancelled">❌ বাতিল / Cancelled ({cancelledOrdersCount})</option>
                    </select>
                  </div>

                  {/* Active Filter Clear & Total Stats */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 text-xs font-bold text-neutral-600">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
                      <Filter className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{filteredOrders.length}টি দেখাচ্ছে</span>
                      <span className="text-neutral-300">|</span>
                      <span className="text-emerald-700">৳{filteredOrdersTotalAmount.toLocaleString('bn-BD')}</span>
                    </div>

                    {/* Export to Excel Toolbar Button */}
                    <button
                      type="button"
                      onClick={() => handleExportOrdersToExcel(filteredOrders)}
                      disabled={isExportingExcel || filteredOrders.length === 0}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="ফিল্টারকৃত অর্ডারসমূহ Excel / CSV ফাইলে ডাউনলোড করুন"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                      <span className="hidden sm:inline">Export to Excel</span>
                      <span className="sm:hidden">Excel</span>
                    </button>

                    {(orderFilter !== 'all' || orderAreaFilter !== 'all' || searchQuery.trim() !== '') && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderFilter('all');
                          setOrderAreaFilter('all');
                          setSearchQuery('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                        title="ফিল্টার রিসেট করুন"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>রিসেট</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bulk Actions Bar (Appears when 1 or more orders are selected) */}
                {selectedOrderIds.length > 0 && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500/40 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                        {selectedOrderIds.length}
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                          <span>{selectedOrderIds.length}টি অর্ডার সিলেক্ট করা হয়েছে</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-md font-bold">Bulk Action</span>
                        </div>
                        <div className="text-[11px] text-emerald-800">
                          একসাথে একাধিক অর্ডারের স্ট্যাটাস পরিবর্তন করুন
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-emerald-300 shadow-2xs">
                        <span className="text-[11px] font-bold text-neutral-600">নতুন স্ট্যাটাস:</span>
                        <select
                          value={bulkStatusToApply}
                          onChange={(e) => setBulkStatusToApply(e.target.value as OrderStatus)}
                          disabled={isBulkUpdating}
                          className="text-xs font-bold bg-transparent text-emerald-900 border-none focus:outline-none cursor-pointer py-1"
                        >
                          <option value="confirmed">✅ কনফার্মড (Confirmed)</option>
                          <option value="processing">⚙️ প্রসেসিং (Processing)</option>
                          <option value="shipped">🚚 অন দ্য ওয়ে (Shipped)</option>
                          <option value="delivered">📦 ডেলিভার্ড (Delivered)</option>
                          <option value="pending">⏳ পেন্ডিং (Pending)</option>
                          <option value="cancelled">❌ বাতিল (Cancelled)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyBulkOrderStatus}
                        disabled={isBulkUpdating}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="সিলেক্ট করা সব অর্ডারে এই স্ট্যাটাস প্রয়োগ করুন"
                      >
                        {isBulkUpdating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>আপডেট হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>স্ট্যাটাস আপডেট করুন ({selectedOrderIds.length})</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedOrderIds([])}
                        disabled={isBulkUpdating}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold border border-neutral-200 transition-colors cursor-pointer"
                        title="সিলেকশন বাতিল করুন"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>বাতিল</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isAllFilteredOrdersSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isSomeFilteredOrdersSelected;
                            }}
                            onChange={handleToggleSelectAllOrders}
                            disabled={filteredOrders.length === 0}
                            title="সব অর্ডার সিলেক্ট / আন-সিলেক্ট করুন"
                            className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                        </th>
                        <th className="py-3 px-4">অর্ডার নং ও সময়</th>
                        <th className="py-3 px-4">গ্রাহকের নাম ও ঠিকানা</th>
                        <th className="py-3 px-4">অর্ডারের পণ্যসমূহ</th>
                        <th className="py-3 px-4 text-right">টাকা ও পেমেন্ট</th>
                        <th className="py-3 px-4">বর্তমান স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-center">স্ট্যাটাস পরিবর্তন</th>
                        <th className="py-3 px-4 text-center">চালান / রসিদ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-neutral-500">
                            কোনো অর্ডার পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const isSelected = selectedOrderIds.includes(order.id);
                          return (
                            <tr 
                              key={order.id} 
                              className={`transition-colors ${
                                isSelected ? 'bg-emerald-50/70 hover:bg-emerald-50' : 'hover:bg-neutral-50/60'
                              }`}
                            >
                              <td className="py-3.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectOrder(order.id)}
                                  title={`অর্ডার #${order.invoiceNumber || order.orderNumber} সিলেক্ট করুন`}
                                  className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                />
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-mono font-bold text-neutral-900 flex items-center gap-1.5">
                                  <span>#{order.invoiceNumber || order.orderNumber}</span>
                                  {order.serialNo && (
                                    <span className="text-[10px] font-sans font-bold bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded border border-neutral-200">
                                      সিরিয়াল #{order.serialNo}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {formatOrderDateTime(order.createdAt)}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-neutral-900">{order.customerName}</div>
                                <div className="font-mono text-neutral-600 flex items-center gap-1.5 mt-0.5">
                                  <Phone className="w-3 h-3 text-neutral-400" />
                                  <a href={`tel:${order.customerPhone}`} className="hover:underline font-bold text-neutral-900">
                                    {order.customerPhone}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => setEditingOrder(order)}
                                    className="text-neutral-400 hover:text-emerald-700 p-0.5 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="গ্রাহকের মোবাইল নম্বর ও তথ্য পরিবর্তন করুন"
                                  >
                                    <Edit2 className="w-3 h-3 text-emerald-600" />
                                  </button>
                                </div>
                                <div className="text-[11px] text-neutral-500 mt-1 max-w-xs truncate">
                                  <MapPin className="w-3 h-3 inline text-neutral-400 mr-0.5" />
                                  {order.customerAddress} ({order.deliveryArea === 'dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'})
                                </div>
                                {order.orderNotes && (
                                  <div className="mt-1.5 p-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium flex items-start gap-1 max-w-xs leading-tight">
                                    <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                    <span><strong className="font-bold">নোট:</strong> {order.orderNotes}</span>
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="text-neutral-700">
                                      <span className="font-medium">{item.productName}</span>{' '}
                                      <span className="text-neutral-500">x{item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                                  ৳{order.total.toLocaleString()}
                                </div>

                                {(() => {
                                  const adv = order.advancePaid ?? (order.paymentMethod !== 'cod' ? order.total : 0);
                                  const due = order.dueAmount !== undefined ? order.dueAmount : Math.max(0, order.total - adv);

                                  if (adv > 0) {
                                    if (due === 0 || adv >= order.total) {
                                      return (
                                        <div className="mt-0.5">
                                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                            অগ্রিম পেইড: ৳{order.total.toLocaleString()}
                                          </span>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div className="flex flex-col items-end gap-0.5 mt-0.5">
                                        <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                                          জমা: ৳{adv.toLocaleString()}
                                        </span>
                                        <span className="text-[10.5px] font-black text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 font-mono">
                                          বকেয়া: ৳{due.toLocaleString()}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="text-[10.5px] font-semibold text-neutral-600 mt-0.5">
                                      বকেয়া: ৳{order.total.toLocaleString()}
                                    </div>
                                  );
                                })()}

                                <div className="text-[11px] mt-1">
                                  {order.paymentMethod === 'bkash' ? (
                                    <div className="flex flex-col items-end">
                                      <span className="inline-flex items-center gap-1 font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
                                        বিকাশ
                                        {order.trxId && <span className="font-mono text-[10px]">({order.trxId})</span>}
                                      </span>
                                      {order.senderNumber && (
                                        <span className="text-[10px] text-neutral-500 font-mono">
                                          প্রেরক: {order.senderNumber}
                                        </span>
                                      )}
                                    </div>
                                  ) : order.paymentMethod === 'nagad' ? (
                                    <div className="flex flex-col items-end">
                                      <span className="inline-flex items-center gap-1 font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                        নগদ
                                        {order.trxId && <span className="font-mono text-[10px]">({order.trxId})</span>}
                                      </span>
                                      {order.senderNumber && (
                                        <span className="text-[10px] text-neutral-500 font-mono">
                                          প্রেরক: {order.senderNumber}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-neutral-500">ক্যাশ অন ডেলিভারি</span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                {renderStatusBadge(order.status)}
                                {order.status === 'delivered' && (
                                  <div className="mt-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyTrackingLink(order)}
                                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                                      title="ট্র্যাকিং লিংক কপি করে কাস্টমারকে শেয়ার করুন"
                                    >
                                      {copiedTrackOrderId === order.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          <span>লিংক কপিড!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-emerald-700" />
                                          <span>Copy Tracking Link</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                  }
                                  className="px-2.5 py-1 text-xs rounded border border-neutral-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                                >
                                  <option value="pending">পেন্ডিং</option>
                                  <option value="processing">প্রসেসিং (Processing)</option>
                                  <option value="confirmed">কনফার্মড</option>
                                  <option value="shipped">অন দ্য ওয়ে (শিপড)</option>
                                  <option value="delivered">ডেলিভার্ড</option>
                                  <option value="cancelled">বাতিল</option>
                                </select>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingOrder(order)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition-colors cursor-pointer"
                                    title="গ্রাহকের ফোন নম্বর ও অর্ডার এডিট করুন"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                    <span>এডিট</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInvoiceOrder(order)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                                    title="চালান রশিদ দেখুন ও প্রিন্ট করুন"
                                  >
                                    <Receipt className="w-3.5 h-3.5 text-amber-700" />
                                    <span>চালান</span>
                                  </button>
                                  {order.status === 'delivered' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyTrackingLink(order)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                                      title="প্যাকেজ ট্র্যাকিং লিংক কপি করুন"
                                    >
                                      {copiedTrackOrderId === order.id ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>কপিড</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5 text-emerald-700" />
                                          <span>Copy Tracking Link</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                  {onDeleteOrder && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeleteConfirmation({
                                          type: 'order',
                                          id: order.id,
                                          title: `অর্ডার #${order.invoiceNumber || order.orderNumber} (${order.customerName})`,
                                          subtitle: `মোট বিল: ৳${order.total.toLocaleString()} | ফোন: ${order.customerPhone}`
                                        });
                                      }}
                                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                                      title="এই অর্ডারের সকল বিবরণ মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS DATABASE */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  গ্রাহক ডাটাবেস ও হিস্ট্রি ({customers.length} জন)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  অর্ডারকারী কাস্টমারদের তথ্য, মোবাইল নম্বর এবং মোট খরচের বিবরণ
                </p>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">গ্রাহকের নাম</th>
                      <th className="py-3 px-4">মোবাইল নম্বর</th>
                      <th className="py-3 px-4">ঠিকানা</th>
                      <th className="py-3 px-4 text-center">মোট অর্ডার</th>
                      <th className="py-3 px-4 text-right">মোট ক্রয় (৳)</th>
                      <th className="py-3 px-4">সর্বশেষ অর্ডার</th>
                      <th className="py-3 px-4 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-neutral-400 italic">
                          কোনো গ্রাহকের তথ্য পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      customers.map((c, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-neutral-900">{c.name}</td>
                          <td className="py-3.5 px-4 font-mono">
                            <a href={`tel:${c.phone}`} className="text-neutral-700 hover:underline">
                              {c.phone}
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate">{c.address}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-900">{c.ordersCount}টি</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-right tabular-nums text-neutral-900">
                            ৳{c.totalSpent.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 text-[11px] font-mono">{c.lastOrderDate}</td>
                          <td className="py-3.5 px-4 text-center">
                            {onDeleteOrder && (
                              <button
                                type="button"
                                onClick={() => {
                                  const key = c.phone.trim() || c.name.trim();
                                  setDeleteConfirmation({
                                    type: 'order',
                                    id: `customer-${key}`,
                                    title: c.name,
                                    subtitle: `ফোন: ${c.phone} | মোট ${c.ordersCount}টি অর্ডার ও ডাটাবেস বিবরণ মুছে যাবে`
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 text-[11px] font-semibold transition-colors cursor-pointer"
                                title="এই গ্রাহকের অর্ডার বিবরণ মুছুন"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>বিবরণ মুছুন</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ARCHIVE (RECOVERY CENTER) */}
          {activeTab === 'archive' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-neutral-500" />
                    আর্কাইভ ও রিকভারি সেন্টার
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    অ্যাডমিন প্যানেল থেকে মুছে ফেলা সকল অর্ডার এবং মেসেজ এখানে চিরস্থায়ীভাবে সংরক্ষিত আছে।
                  </p>
                </div>
              </div>

              {/* Archived Orders Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-neutral-800">আর্কাইভকৃত অর্ডারসমূহ ({archivedOrders.length})</h4>
                  </div>
                  <input
                    type="text"
                    placeholder="সার্চ (নাম, ফোন, ইনভয়েস)..."
                    value={archivedOrderSearch}
                    className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                    onChange={(e) => setArchivedOrderSearch(e.target.value)}
                  />
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-3 px-4">ইনভয়েস</th>
                        <th className="py-3 px-4">গ্রাহক ও ফোন</th>
                        <th className="py-3 px-4">তারিখ</th>
                        <th className="py-3 px-4 text-right">মোট টাকা</th>
                        <th className="py-3 px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {archivedOrders
                        .filter(o => 
                          archivedOrderSearch === '' || 
                          o.customerName.toLowerCase().includes(archivedOrderSearch.toLowerCase()) || 
                          o.customerPhone.toLowerCase().includes(archivedOrderSearch.toLowerCase()) || 
                          (o.invoiceNumber || o.orderNumber).toLowerCase().includes(archivedOrderSearch.toLowerCase())
                        )
                        .length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-neutral-400 italic">
                            কোনো আর্কাইভকৃত অর্ডার পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        archivedOrders
                        .filter(o => 
                          archivedOrderSearch === '' || 
                          o.customerName.toLowerCase().includes(archivedOrderSearch.toLowerCase()) || 
                          o.customerPhone.toLowerCase().includes(archivedOrderSearch.toLowerCase()) || 
                          (o.invoiceNumber || o.orderNumber).toLowerCase().includes(archivedOrderSearch.toLowerCase())
                        )
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors opacity-80">
                            <td className="py-3 px-4 font-mono font-bold text-neutral-800">
                              #{order.invoiceNumber || order.orderNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-neutral-900">{order.customerName}</div>
                              <div className="text-[10px] text-neutral-500 font-mono">{order.customerPhone}</div>
                            </td>
                            <td className="py-3 px-4 text-neutral-500 font-mono">{order.createdAt}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                              ৳{order.total.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => setInvoiceOrder(order)}
                                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  ভিউ ইনভয়েস
                                </button>
                                <button
                                  onClick={async () => {
                                    setInvoiceOrder(order);
                                    await new Promise((r) => setTimeout(r, 300));
                                    handleDownloadPdf();
                                  }}
                                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold hover:bg-amber-100 transition-colors"
                                >
                                  <FileText className="w-3 h-3" />
                                  ডাউনলোড ইনভয়েস
                                </button>
                                <button
                                  onClick={() => {
                                    // Restore order
                                    const restored = { ...order, isArchived: false };
                                    onUpdateOrder?.(restored);
                                  }}
                                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  রিস্টোর (Restore)
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Archived Messages Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-neutral-800">আর্কাইভকৃত পাইকারি অনুসন্ধান ({archivedMessages.length})</h4>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-3 px-4">নাম ও প্রতিষ্ঠান</th>
                        <th className="py-3 px-4">ফোন নম্বর</th>
                        <th className="py-3 px-4">তারিখ</th>
                        <th className="py-3 px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {archivedMessages.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-neutral-400 italic">
                            কোনো আর্কাইভকৃত মেসেজ পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        archivedMessages.map((msg) => (
                          <tr key={msg.id} className="hover:bg-neutral-50/50 transition-colors opacity-80">
                            <td className="py-3 px-4">
                              <div className="font-bold text-neutral-900">{msg.name}</div>
                              <div className="text-[10px] text-amber-800">{msg.wholesaleDetails?.businessName || 'ব্যক্তিগত'}</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-neutral-600">{msg.phone}</td>
                            <td className="py-3 px-4 text-neutral-500 font-mono">{msg.timestamp}</td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  // Restore message
                                  const restored = { ...msg, isArchived: false };
                                  onUpdateMessage?.(restored);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold hover:bg-blue-100 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                রিস্টোর (Restore)
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    স্টোরের পণ্য তালিকা ({products.length}টি)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    নতুন ড্রাই ফ্রুটস/পণ্য যোগ করুন, দাম পরিবর্তন করুন অথবা স্টক নিয়ন্ত্রণ করুন
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="পণ্য খুঁজুন..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <button
                    onClick={handleOpenAddProduct}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন পণ্য যোগ</span>
                  </button>
                </div>
              </div>

              {/* Product Sub-tabs (Spices vs Clothing) & Stock Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex border-b border-neutral-200 gap-1.5 p-1 bg-neutral-100 rounded-xl max-w-md shadow-inner">
                  <button
                    type="button"
                    onClick={() => setProductSubTab('spices')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      productSubTab === 'spices'
                        ? 'bg-white text-amber-800 shadow-xs border border-neutral-200/50 scale-102 font-black'
                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/50'
                    }`}
                  >
                    <span>🥜 ড্রাই ফ্রুটস ও বাদাম</span>
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${productSubTab === 'spices' ? 'bg-amber-100 text-amber-900 font-extrabold' : 'bg-neutral-200 text-neutral-600'}`}>
                      {products.filter(p => !isClothingProduct(p)).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductSubTab('clothing')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      productSubTab === 'clothing'
                        ? 'bg-white text-emerald-800 shadow-xs border border-neutral-200/50 scale-102 font-black'
                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/50'
                    }`}
                  >
                    <span>👗 প্রিমিয়াম পোশাক ও ফ্যাশন</span>
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${productSubTab === 'clothing' ? 'bg-emerald-100 text-emerald-900 font-extrabold' : 'bg-neutral-200 text-neutral-600'}`}>
                      {products.filter(p => isClothingProduct(p)).length}
                    </span>
                  </button>
                </div>

                {/* Stock status filter buttons */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setProductStockFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      productStockFilter === 'all'
                        ? 'bg-white text-neutral-900 shadow-xs font-extrabold'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    সব ({products.filter(p => productSubTab === 'clothing' ? isClothingProduct(p) : !isClothingProduct(p)).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductStockFilter('in_stock')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      productStockFilter === 'in_stock'
                        ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                        : 'text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>ইন স্টক ({products.filter(p => (productSubTab === 'clothing' ? isClothingProduct(p) : !isClothingProduct(p)) && p.inStock !== false).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductStockFilter('stock_out')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      productStockFilter === 'stock_out'
                        ? 'bg-rose-700 text-white shadow-xs font-extrabold'
                        : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>স্টক আউট ({products.filter(p => (productSubTab === 'clothing' ? isClothingProduct(p) : !isClothingProduct(p)) && p.inStock === false).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductStockFilter('low_stock')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      productStockFilter === 'low_stock'
                        ? 'bg-amber-600 text-white shadow-xs font-extrabold ring-2 ring-amber-500/30'
                        : 'text-amber-800 hover:bg-amber-50'
                    }`}
                    title={`নির্ধারিত থ্রেশহোল্ড (≤ ${currentLowStockThreshold} ইউনিট) এর নিচে থাকা পণ্যসমূহ`}
                  >
                    <AlertTriangle className={`w-3.5 h-3.5 ${products.filter(p => (productSubTab === 'clothing' ? isClothingProduct(p) : !isClothingProduct(p)) && isProductLowStock(p, currentLowStockThreshold)).length > 0 ? 'text-amber-600 animate-pulse' : 'text-neutral-400'}`} />
                    <span>⚠️ লো স্টক ({products.filter(p => (productSubTab === 'clothing' ? isClothingProduct(p) : !isClothingProduct(p)) && isProductLowStock(p, currentLowStockThreshold)).length})</span>
                  </button>
                </div>
              </div>

              {/* Products Tab Low Stock Alert Banner */}
              <LowStockAlertBanner
                products={products.filter(p => productSubTab === 'clothing' ? isClothingProduct(p) : !isClothingProduct(p))}
                settings={settings}
                onOpenLowStockModal={() => setLowStockModalOpen(true)}
                onQuickRestock={handleQuickRestockProduct}
              />

              {/* Products Table */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">ছবি</th>
                        <th className="py-3 px-4">পণ্যের নাম</th>
                        <th className="py-3 px-4">ক্যাটাগরি</th>
                        <th className="py-3 px-4 text-center">পরিমাণ ও একক</th>
                        <th className="py-3 px-4">প্যাক ও ওজন অপশন</th>
                        <th className="py-3 px-4 text-right">মূল্য ও অফার (৳)</th>
                        <th className="py-3 px-4 text-center">মজুদ ও রিস্টক (Stock & Restock)</th>
                        <th className="py-3 px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredProducts.map((prod) => {
                        const isLow = isProductLowStock(prod, currentLowStockThreshold);
                        const stockInfo = getStockStatusDisplay(prod, currentLowStockThreshold);

                        return (
                        <tr key={prod.id} className={`hover:bg-neutral-50/60 transition-colors ${prod.inStock === false ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/25' : ''}`}>
                          <td className="py-2.5 px-4">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 relative">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.nameBn}
                                  className={`w-full h-full object-cover ${prod.inStock === false ? 'grayscale-50 opacity-80' : ''}`}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                                  HB
                                </div>
                              )}
                              {prod.inStock === false && (
                                <div className="absolute inset-0 bg-rose-950/60 flex items-center justify-center">
                                  <span className="text-[8px] font-black text-white px-1 py-0.5 rounded bg-rose-700 leading-none">
                                    OUT
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900">{prod.nameBn}</span>
                              {isLow && (
                                <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-black border flex items-center gap-0.5 ${
                                  prod.inStock === false ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}>
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>{prod.inStock === false ? (prod.stockStatusText || 'স্টক আউট') : 'লো স্টক'}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500">{prod.nameEn}</div>
                          </td>

                          <td className="py-2.5 px-4">
                            <span className="text-neutral-700 font-medium">{prod.categoryBn}</span>
                          </td>

                          <td className="py-2.5 px-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px] font-mono">
                              {prod.quantity || '1'} {prod.unit || 'KG'}
                            </span>
                          </td>

                          <td className="py-2.5 px-4">
                            {prod.weightOptions && prod.weightOptions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {prod.weightOptions.map((w, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700 font-medium"
                                  >
                                    {w.label}: ৳{w.price}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">ডিফল্ট সাইজ</span>
                            )}
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            <div className="font-mono font-bold text-neutral-900 text-sm tabular-nums">
                              ৳{prod.price.toLocaleString()}
                            </div>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                <span className="text-[10.5px] text-neutral-400 font-mono line-through">
                                  ৳{prod.originalPrice.toLocaleString()}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                  {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% ছাড়
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-4 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {/* Stock status indicator pill */}
                              <div className="flex items-center gap-1">
                                {isLow && (
                                  <span title="লো-স্টক সতর্কবার্তা!" className="inline-flex">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${stockInfo.badgeBg} ${stockInfo.badgeText} ${stockInfo.badgeBorder}`}>
                                  <span>{stockInfo.label}</span>
                                </span>
                              </div>

                              {/* Inline Quick +/- Restock Adjuster */}
                              <div className="flex items-center gap-1">
                                <div className="flex items-center bg-neutral-100 rounded-lg border border-neutral-200 px-1 py-0.5 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateProductStockDirectly(prod.id, getProductStockQty(prod) - 1)}
                                    disabled={getProductStockQty(prod) <= 0}
                                    className="p-1 rounded text-neutral-500 hover:text-neutral-900 disabled:opacity-30 cursor-pointer"
                                    title="১ ইউনিট কমান"
                                  >
                                    <Minus className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="w-7 text-center font-mono font-black text-neutral-900 text-[11px]">
                                    {getProductStockQty(prod)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateProductStockDirectly(prod.id, getProductStockQty(prod) + 1)}
                                    className="p-1 rounded text-neutral-500 hover:text-neutral-900 cursor-pointer"
                                    title="১ ইউনিট বাড়ান"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleProductStock(prod.id, prod.inStock !== false)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                                    prod.inStock !== false
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                                  }`}
                                  title={prod.inStock !== false ? 'ক্লিক করে স্টক আউট করুন' : 'ইন স্টক করুন'}
                                >
                                  {prod.inStock !== false ? 'অন' : 'অফ'}
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                                title="এডিট করুন"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmation({
                                    type: 'product',
                                    id: prod.id,
                                    title: prod.nameBn,
                                    subtitle: `ক্যাটাগরি: ${prod.categoryBn} | মূল্য: ৳${prod.price}`
                                  });
                                }}
                                className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="এই পণ্য ও বিবরণ ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WHOLESALE MANAGEMENT (পাইকারি ও ডিলার অনুসন্ধান) */}
          {activeTab === 'wholesale' && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                      <Building2 className="w-5 h-5 text-amber-800" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">
                        পাইকারি ও ডিলার অনুসন্ধান ({wholesaleInquiries.length}টি)
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        দোকানদার, রেস্টুরেন্ট, সুপারশপ ও ফ্যাশন শো-রুমের পাইকারি ক্রয়ের বিস্তারিত বার্তা ও যোগাযোগ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={wholesaleSearchQuery}
                      onChange={(e) => setWholesaleSearchQuery(e.target.value)}
                      placeholder="প্রতিষ্ঠান, নাম, ফোন বা জেলা..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 w-56 sm:w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Wholesale Metrics Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
                  <div className="text-[11px] font-medium text-neutral-500">মোট পাইকারি অনুসন্ধান</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-0.5">
                    {wholesaleInquiries.length}টি
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">সকল বাল্ক ক্রেতা</div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-amber-800">নতুন / অপেক্ষমান (New)</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-amber-950 mt-0.5">
                    {newWholesaleCount}টি
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">জরুরি রেসপন্স প্রয়োজন</div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-blue-800">যোগাযোগ সম্পন্ন</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-blue-950 mt-0.5">
                    {contactedWholesaleCount}টি
                  </div>
                  <div className="text-[10px] text-blue-700 mt-0.5">কথা চলছে / স্যাম্পল পাঠানো</div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
                  <div className="text-[11px] font-semibold text-emerald-800">ডিল সম্পন্ন (Closed)</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-950 mt-0.5">
                    {dealClosedWholesaleCount}টি
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">সফল পাইকারি সরবরাহ</div>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['all', 'new', 'contacted', 'quoted', 'deal_closed', 'general'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setWholesaleFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      wholesaleFilter === st
                        ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                        : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {st === 'all' && `সব পাইকারি অনুসন্ধান (${wholesaleInquiries.length})`}
                    {st === 'new' && `নতুন (${newWholesaleCount})`}
                    {st === 'contacted' && `যোগাযোগ চলছে (${contactedWholesaleCount})`}
                    {st === 'quoted' && `কোটেশন প্রেরিত (${quotedWholesaleCount})`}
                    {st === 'deal_closed' && `ডিল সফল (${dealClosedWholesaleCount})`}
                    {st === 'general' && `সাধারণ কন্টাক্ট বার্তা (${generalMessages.length})`}
                  </button>
                ))}
              </div>

              {/* Inquiries Table */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">প্রতিষ্ঠান ও ধরন</th>
                        <th className="py-3 px-4">যোগাযোগকারী ও ফোন</th>
                        <th className="py-3 px-4">আগ্রহী পণ্য ও পরিমাণ</th>
                        <th className="py-3 px-4">জেলা / এলাকা</th>
                        <th className="py-3 px-4">স্ট্যাটাস পরিবর্তন</th>
                        <th className="py-3 px-4 text-center">দ্রুত যোগাযোগ</th>
                        <th className="py-3 px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredWholesale.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-neutral-500">
                            {wholesaleFilter === 'general'
                              ? 'কোনো সাধারণ কন্টাক্ট বার্তা পাওয়া যায়নি।'
                              : 'কোনো পাইকারি অনুসন্ধানের বার্তা পাওয়া যায়নি।'}
                          </td>
                        </tr>
                      ) : (
                        filteredWholesale.map((item) => {
                          const w = item.wholesaleDetails || {};
                          const rawPhone = item.phone || '';
                          const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                          const waPhone = cleanPhone.startsWith('880') ? cleanPhone : cleanPhone.startsWith('0') ? `880${cleanPhone.slice(1)}` : `880${cleanPhone}`;
                          const waText = encodeURIComponent(`আসসালামু আলাইকুম ${item.name} সাহেব, ${w.businessName ? `"${w.businessName}"-এর পক্ষ থেকে ` : ''}আপনার পাইকারি অনুসন্ধানের বিষয়ে ${settings.storeName} থেকে যোগাযোগ করছি।`);

                          return (
                            <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>{w.businessName || 'ব্যক্তিগত ব্যবসা / উদ্যোক্তা'}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                                    {w.businessType || 'দোকানদার / পাইকারি ক্রেতা'}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 font-mono">
                                    {item.timestamp}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-neutral-900">{item.name}</div>
                                {item.phone && (
                                  <div className="font-mono text-neutral-600 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-neutral-400" />
                                    <a href={`tel:${item.phone}`} className="hover:underline font-semibold text-neutral-800">
                                      {item.phone}
                                    </a>
                                  </div>
                                )}
                                {item.email && !item.email.includes('.local') && (
                                  <div className="text-[11px] text-neutral-500 truncate max-w-[150px] mt-0.5">
                                    {item.email}
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-neutral-900">
                                  {w.productInterest || 'প্রিমিয়াম ড্রাই ফ্রুটস / ফ্যাশন পোশাক'}
                                </div>
                                <div className="text-[11px] text-neutral-600 font-mono mt-0.5 flex items-center gap-1">
                                  <span className="text-neutral-400 font-sans">চাহিদা:</span>
                                  <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                                    {w.estimatedQuantity || 'আলোচনা সাপেক্ষে'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                                  <MapPin className="w-3 h-3 text-neutral-400" />
                                  <span>{w.district || 'বাংলাদেশ'}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <select
                                  value={w.status || 'new'}
                                  onChange={(e) => handleUpdateWholesaleStatus(item, e.target.value)}
                                  className="text-xs font-semibold px-2 py-1 rounded-lg border border-neutral-300 bg-white shadow-2xs focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                                >
                                  <option value="new">🟡 নতুন অনুসন্ধান</option>
                                  <option value="contacted">🔵 যোগাযোগ হয়েছে</option>
                                  <option value="quoted">🟣 কোটেশন প্রেরিত</option>
                                  <option value="deal_closed">🟢 ডিল সম্পন্ন</option>
                                </select>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {item.phone && (
                                    <a
                                      href={`tel:${item.phone}`}
                                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                                      title="সরাসরি কল দিন"
                                    >
                                      <PhoneCall className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/${waPhone}?text=${waText}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors"
                                      title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedWholesaleItem(item)}
                                    className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                                    title="বিস্তারিত দেখুন"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  {onDeleteMessage && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeleteConfirmation({
                                          type: 'wholesale',
                                          id: item.id,
                                          title: item.wholesaleDetails?.businessName || item.name,
                                          subtitle: `মোবাইল: ${item.phone || '-'} | পণ্য: ${item.wholesaleDetails?.productInterest || 'খাঁটি পণ্য'}`
                                        });
                                      }}
                                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                      title="এই পাইকারি অনুসন্ধানের বিবরণ মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC MANAGEMENT PANELS (6 SECTIONS) */}
          {activeTab.startsWith('settings') && (
            <div className="max-w-4xl bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Header Banner for Active Management Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                <div>
                  <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2.5">
                    {activeTab === 'settings_general' && <><Settings className="w-5 h-5 text-rose-600" /><span>১. সাধারণ সেটিংস (General Settings)</span></>}
                    {activeTab === 'settings_header_footer' && <><FileText className="w-5 h-5 text-blue-600" /><span>২. হেডার ও ফুটার ম্যানেজার (Header & Footer)</span></>}
                    {activeTab === 'settings_homepage' && <><ImageIcon className="w-5 h-5 text-emerald-600" /><span>৩. হোমপেজ ও ব্যানার ম্যানেজার (Homepage Content)</span></>}
                    {activeTab === 'settings_appearance' && <><Sparkles className="w-5 h-5 text-purple-600" /><span>৪. থিম ও অ্যাপিয়ারেন্স (Theme & Appearance)</span></>}
                    {activeTab === 'settings_seo' && <><Search className="w-5 h-5 text-amber-600" /><span>৫. এসইও ও স্ক্রিপ্ট সেটিংস (SEO & Scripts)</span></>}
                    {activeTab === 'settings_security' && <><Shield className="w-5 h-5 text-indigo-600" /><span>৬. সিকিউরিটি ও রোলস (Admin Security & Roles)</span></>}
                    {activeTab === 'settings_content_manager' && <><BadgePercent className="w-5 h-5 text-emerald-600" /><span>৭. কনটেন্ট ও কার্ড কাস্টমাইজেশন (Content & Cards Manager)</span></>}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {activeTab === 'settings_general' && "স্টোরের নাম, লোগো, ফেভিকন, যোগাযোগ নম্বর এবং সোশ্যাল মিডিয়া লিংক কনফিগার করুন"}
                    {activeTab === 'settings_header_footer' && "হেডার নেভিগেশন মেনু, ফুটার টেক্সট, কপিরাইট এবং দরকারি লিংকসমূহ নিয়ন্ত্রণ করুন"}
                    {activeTab === 'settings_homepage' && "হিরো ব্যানার স্লাইড, সেকশন টগল এবং হোমপেজের মূল বিবরণ পরিবর্তন করুন"}
                    {activeTab === 'settings_appearance' && "ওয়েবসাইটের কালার স্কিম, ফন্ট এবং কাস্টম সিএসএস (CSS) স্টাইল দিন"}
                    {activeTab === 'settings_seo' && "গ্লোবাল মেটা ট্যাগ, এসইও কিওয়ার্ড এবং গুগল অ্যানালিটিক্স / ফেসবুক পিক্সেল স্ক্রিপ্ট যুক্ত করুন"}
                    {activeTab === 'settings_security' && "এডমিন প্রোফাইল আপডেট, পাসওয়ার্ড পরিবর্তন এবং রোল-ভিত্তিক অ্যাক্সেস ম্যানেজ করুন"}
                    {activeTab === 'settings_content_manager' && "বৈশিষ্ট্য কার্ড, এফএকিউ (FAQ), গ্রাহক রিভিউ এবং সেকশন কনটেন্ট যুক্ত, এডিট ও সেভ করুন"}
                  </p>
                </div>

                {/* Quick Navigation Pills */}
                <div className="flex flex-wrap gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 text-[11px] font-bold">
                  {[
                    { id: 'settings_general', label: 'সাধারণ' },
                    { id: 'settings_header_footer', label: 'হেডার-ফুটার' },
                    { id: 'settings_homepage', label: 'হোমপেজ' },
                    { id: 'settings_appearance', label: 'থিম' },
                    { id: 'settings_seo', label: 'এসইও' },
                    { id: 'settings_security', label: 'সিকিউরিটি' },
                    { id: 'settings_content_manager', label: 'কনটেন্ট ও কার্ডস' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActiveTab(p.id as AdminTab)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === p.id
                          ? 'bg-white text-neutral-950 shadow-xs font-black'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">

                {/* 1. GENERAL SETTINGS */}
                {activeTab === 'settings_general' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        ব্র্যান্ড পরিচিতি ও লোগো
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">স্টোরের নাম (Site Title) *</label>
                          <input
                            type="text"
                            required
                            value={tempSettings.storeName || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, storeName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:ring-1 focus:ring-neutral-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">ট্যাগলাইন / স্লোগান</label>
                          <input
                            type="text"
                            value={tempSettings.storeTagline || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, storeTagline: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:ring-1 focus:ring-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">লোগো সাব-টাইটেল / ব্যাজ (যেমন: প্রিমিয়াম স্টোর)</label>
                          <input
                            type="text"
                            value={tempSettings.storeBadgeBn || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, storeBadgeBn: e.target.value })}
                            placeholder="প্রিমিয়াম স্টোর"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:ring-1 focus:ring-neutral-900 font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">লোগো ছবি (Logo Image URL)</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={tempSettings.logoImage || ''}
                              onChange={(e) => setTempSettings({ ...tempSettings, logoImage: e.target.value })}
                              placeholder="https://..."
                              className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono text-xs"
                            />
                            {tempSettings.logoImage && (
                              <img src={tempSettings.logoImage} alt="Logo" className="w-9 h-9 object-cover rounded-lg border" />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">ফেভিকন (Favicon URL)</label>
                          <input
                            type="text"
                            value={tempSettings.favicon || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, favicon: e.target.value })}
                            placeholder="https://... favicon.ico"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        যোগাযোগের তথ্য ও ঠিকানা (Contact Info)
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">হটলাইন / ফোন নম্বর *</label>
                          <input
                            type="text"
                            required
                            value={tempSettings.phone || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">হোয়াটসঅ্যাপ নম্বর</label>
                          <input
                            type="text"
                            value={tempSettings.whatsappNumber || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">ইমেইল ঠিকানা</label>
                          <input
                            type="email"
                            value={tempSettings.email || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">ভৌত ঠিকানা (Address)</label>
                          <input
                            type="text"
                            value={tempSettings.address || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        সোশ্যাল মিডিয়া লিংক (Social Media)
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">ফেসবুক পেজ / গ্রুপ URL</label>
                          <input
                            type="text"
                            value={tempSettings.facebookUrl || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, facebookUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">ইনস্টাগ্রাম URL</label>
                          <input
                            type="text"
                            value={tempSettings.instagramUrl || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, instagramUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">ইউটিউব চ্যানেল URL</label>
                          <input
                            type="text"
                            value={tempSettings.youtubeUrl || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, youtubeUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">টিকটক প্রোফাইল URL</label>
                          <input
                            type="text"
                            value={tempSettings.tiktokUrl || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, tiktokUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/60 via-neutral-50 to-orange-50/40 border border-amber-300 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-amber-200 pb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-amber-950">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>ইনভেন্টরি ও লো-স্টক সতর্কবার্তা সীমা (Low Stock Threshold)</span>
                        </span>
                        <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          বর্তমানে: {tempSettings.lowStockThreshold || 5} ইউনিট
                        </span>
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4 items-center">
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">
                            স্বয়ংক্রিয় সতর্কবার্তা সীমা (Alert Threshold) *
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              required
                              value={tempSettings.lowStockThreshold !== undefined ? tempSettings.lowStockThreshold : 5}
                              onChange={(e) =>
                                setTempSettings({
                                  ...tempSettings,
                                  lowStockThreshold: Math.max(1, parseInt(e.target.value, 10) || 5),
                                })
                              }
                              className="w-32 px-3 py-2 rounded-lg border border-amber-300 bg-white font-mono font-bold text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                            />
                            <span className="text-xs font-semibold text-neutral-600">ইউনিট বা পিস</span>
                          </div>
                          <p className="text-[10.5px] text-neutral-500 mt-1">
                            যেকোনো পণ্যের স্টক এই পরিমাণের সমান বা কম হলে ড্যাশবোর্ডে অ্যালার্ট ও দ্রুত রিস্টক অপশন চালু হবে।
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                            দ্রুত প্রিসেট বাটন:
                          </label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[3, 5, 10, 15, 20].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setTempSettings({ ...tempSettings, lowStockThreshold: preset })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                                  (tempSettings.lowStockThreshold || 5) === preset
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-amber-400'
                                }`}
                              >
                                {preset} ইউনিট
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Auto Deduct on Order Toggle */}
                      <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="block font-bold text-neutral-900 text-xs">
                            অর্ডারে স্বয়ংক্রিয় স্টক হ্রাস (Auto-Deduct Stock on Order):
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {tempSettings.autoDeductStockOnOrder
                              ? 'অন: কাস্টমার অর্ডার সাবমিট করলে স্বয়ংক্রিয়ভাবে স্টক কমবে।'
                              : 'বন্ধ (ডিফল্ট): কাস্টমার অর্ডারে স্টক স্বয়ংক্রিয়ভাবে কমবে না; অ্যাডমিন নিজে যাচাই করে স্টক কমাবেন।'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTempSettings({ ...tempSettings, autoDeductStockOnOrder: !tempSettings.autoDeductStockOnOrder })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            tempSettings.autoDeductStockOnOrder
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                          }`}
                        >
                          {tempSettings.autoDeductStockOnOrder ? '🟢 অটো হ্রাস চালু' : '⚪ ম্যানুয়াল স্টক কন্ট্রোল (বন্ধ)'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. HEADER & FOOTER MANAGER */}
                {activeTab === 'settings_header_footer' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <h4 className="font-bold text-neutral-900 text-sm">
                          হেডার নেভিগেশন মেনু ম্যানেজার (Header Menu)
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const newNav = [...(tempSettings.navItems || []), { id: `nav-${Date.now()}`, labelBn: 'নতুন মেনু', labelEn: 'New Menu', href: '#products' }];
                            setTempSettings({ ...tempSettings, navItems: newNav });
                          }}
                          className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-bold text-xs shadow-xs"
                        >
                          + মেনু আইটেম যোগ করুন
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {(tempSettings.navItems || []).map((nav, index) => (
                          <div key={nav.id || index} className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-2xs">
                            <span className="w-6 h-6 rounded-full bg-neutral-100 font-bold text-xs flex items-center justify-center font-mono">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={nav.labelBn}
                              onChange={(e) => {
                                const updated = [...(tempSettings.navItems || [])];
                                updated[index] = { ...updated[index], labelBn: e.target.value, labelEn: e.target.value };
                                setTempSettings({ ...tempSettings, navItems: updated });
                              }}
                              placeholder="মেনুর নাম (যেমন: পণ্যসম্ভার)"
                              className="flex-1 px-3 py-1.5 rounded-lg border text-xs font-bold bg-neutral-50"
                            />
                            <select
                              value={nav.href}
                              onChange={(e) => {
                                const updated = [...(tempSettings.navItems || [])];
                                updated[index] = { ...updated[index], href: e.target.value };
                                setTempSettings({ ...tempSettings, navItems: updated });
                              }}
                              className="w-40 px-2 py-1.5 rounded-lg border text-xs bg-neutral-50"
                            >
                              <option value="#about">বিশুদ্ধতা (#about)</option>
                              <option value="#products">পণ্যসমূহ (#products)</option>
                              <option value="#clothing">পোশাক (#clothing)</option>
                              <option value="#services">প্রক্রিয়াজাতকরণ (#services)</option>
                              <option value="#faq">প্রশ্নোত্তর (#faq)</option>
                              <option value="#contact">যোগাযোগ (#contact)</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (tempSettings.navItems || []).filter((_, i) => i !== index);
                                setTempSettings({ ...tempSettings, navItems: updated });
                              }}
                              className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        ফুটার ম্যানেজার (Footer Content & Copyright)
                      </h4>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">ফুটার বিবরণ (Footer Description)</label>
                        <textarea
                          rows={3}
                          value={tempSettings.footerText || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, footerText: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">কপিরাইট টেক্সট (Copyright Info)</label>
                        <input
                          type="text"
                          value={tempSettings.copyrightText || '© ২০২৬ Halal Bazar BD. All Rights Reserved.'}
                          onChange={(e) => setTempSettings({ ...tempSettings, copyrightText: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. HERO BANNER & HOMEPAGE CONTENT MANAGER */}
                {(activeTab === 'settings_hero' || activeTab === 'settings_homepage') && (
                  <div className="space-y-5">
                    {/* Hero Banner Slides Manager Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-neutral-900 to-emerald-950 text-white space-y-4 shadow-lg border border-emerald-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-3">
                        <div>
                          <h4 className="font-black text-amber-300 text-sm sm:text-base flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>✨ হিরো ব্যানার স্লাইডার ম্যানেজার (Hero Banner Slider Manager)</span>
                          </h4>
                          <p className="text-[11px] text-emerald-200 mt-0.5">
                            হোমপেজের মূল ব্যানার স্লাইডগুলো এখান থেকে সরাসরি যোগ, এডিট, রি-অর্ডার বা ডিলিট করতে পারবেন
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const currentSlides = tempSettings.heroSlides && tempSettings.heroSlides.length > 0 ? tempSettings.heroSlides : [
                              {
                                id: 'slide-1',
                                badgeBn: tempSettings.heroBadge || '✨ ১০০% প্রিমিয়াম ড্রাই ফ্রুটস ও বাদাম',
                                badgeEn: '✨ 100% Premium Dry Fruits & Nuts',
                                titleBn: tempSettings.heroTitle || 'প্রিমিয়াম কাজুবাদাম, কাঠবাদাম ও খেজুরে চলছে স্পেশাল ছাড়!',
                                titleEn: 'Special Discount on Jumbo Cashews, Almonds & Dates!',
                                subtitleBn: tempSettings.heroSubtitle || 'সরাসরি বাগান থেকে সংগৃহীত সেরা মানের অর্গানিক ড্রাই ফ্রুটস।',
                                subtitleEn: 'Directly sourced premium organic dry fruits and nuts.',
                                ctaBn: tempSettings.heroCtaText || 'ড্রাই ফ্রুটস অর্ডার করুন',
                                ctaEn: 'Order Dry Fruits',
                                image: tempSettings.heroImage || 'https://images.unsplash.com/photo-1536591375315-1b836890327b?auto=format&fit=crop&w=1200&q=80',
                                targetAnchor: '#products',
                              }
                            ];
                            const newSlide = {
                              id: `slide-${Date.now()}`,
                              badgeBn: '🔥 নতুন ধামাকা অফার ২০২৬',
                              badgeEn: '🔥 New Mega Offer 2026',
                              titleBn: 'আপনার আকর্ষণীয় অফার বা প্রোডাক্টের শিরোনাম লিখুন',
                              titleEn: 'Your new promotion headline here',
                              subtitleBn: 'ব্যানারের বর্ণনা ও বিশেষ ছাড়ের তথ্য উল্লেখ করুন।',
                              subtitleEn: 'Detailed offer subheadline',
                              ctaBn: 'অর্ডার করুন',
                              ctaEn: 'Order Now',
                              image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
                              targetAnchor: '#products',
                            };
                            setTempSettings({ ...tempSettings, heroSlides: [...currentSlides, newSlide] });
                          }}
                          className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                        >
                          <Plus className="w-4 h-4 text-neutral-950" />
                          <span>+ নতুন হিরো ব্যানার যোগ করুন</span>
                        </button>
                      </div>

                      {/* Slides Cards List */}
                      <div className="space-y-4 pt-1">
                        {(tempSettings.heroSlides && tempSettings.heroSlides.length > 0 ? tempSettings.heroSlides : [
                          {
                            id: 'slide-default-1',
                            badgeBn: tempSettings.heroBadge || '✨ ১০০% প্রিমিয়াম ড্রাই ফ্রুটস ও বাদাম',
                            badgeEn: '✨ 100% Premium Dry Fruits & Nuts',
                            titleBn: tempSettings.heroTitle || 'প্রিমিয়াম কাজুবাদাম, কাঠবাদাম ও খেজুরে চলছে স্পেশাল ছাড়!',
                            titleEn: 'Special Discount on Jumbo Cashews, Almonds & Dates!',
                            subtitleBn: tempSettings.heroSubtitle || 'সরাসরি বাগান থেকে সংগৃহীত সেরা মানের অর্গানিক ড্রাই ফ্রুটস।',
                            subtitleEn: 'Directly sourced premium organic dry fruits and nuts.',
                            ctaBn: tempSettings.heroCtaText || 'ড্রাই ফ্রুটস অর্ডার করুন',
                            ctaEn: 'Order Dry Fruits',
                            image: tempSettings.heroImage || 'https://images.unsplash.com/photo-1536591375315-1b836890327b?auto=format&fit=crop&w=1200&q=80',
                            targetAnchor: '#products',
                          }
                        ]).map((slide, sIndex, arr) => (
                          <div key={slide.id || sIndex} className="p-4 rounded-xl bg-white text-neutral-900 border border-neutral-200 shadow-md space-y-3">
                            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black flex items-center justify-center font-mono">
                                  {sIndex + 1}
                                </span>
                                <span className="font-bold text-xs text-neutral-900">হিরো ব্যানার স্লাইড #{sIndex + 1}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={sIndex === 0}
                                  onClick={() => {
                                    if (sIndex === 0) return;
                                    const updated = [...arr];
                                    const temp = updated[sIndex - 1];
                                    updated[sIndex - 1] = updated[sIndex];
                                    updated[sIndex] = temp;
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  className="text-xs font-black text-neutral-500 hover:text-emerald-800 disabled:opacity-20 cursor-pointer p-1"
                                >
                                  ▲ উপরে
                                </button>
                                <button
                                  type="button"
                                  disabled={sIndex === arr.length - 1}
                                  onClick={() => {
                                    if (sIndex === arr.length - 1) return;
                                    const updated = [...arr];
                                    const temp = updated[sIndex + 1];
                                    updated[sIndex + 1] = updated[sIndex];
                                    updated[sIndex] = temp;
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  className="text-xs font-black text-neutral-500 hover:text-emerald-800 disabled:opacity-20 cursor-pointer p-1"
                                >
                                  ▼ নিচে
                                </button>
                                {arr.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = arr.filter((_, i) => i !== sIndex);
                                      setTempSettings({ ...tempSettings, heroSlides: updated });
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer border border-red-200"
                                  >
                                    ডিলিট
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">ব্যাজ / অফার ট্যাগ (Badge)</label>
                                <input
                                  type="text"
                                  value={slide.badgeBn}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[sIndex] = { ...updated[sIndex], badgeBn: e.target.value };
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  placeholder="যেমন: ✨ স্পেশাল অফার"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">বাটন টেক্সট (CTA Text)</label>
                                <input
                                  type="text"
                                  value={slide.ctaBn}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[sIndex] = { ...updated[sIndex], ctaBn: e.target.value };
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  placeholder="যেমন: অর্ডার করুন"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">প্রধান অফার শিরোনাম (Headline)</label>
                              <textarea
                                rows={2}
                                value={slide.titleBn}
                                onChange={(e) => {
                                  const updated = [...arr];
                                  updated[sIndex] = { ...updated[sIndex], titleBn: e.target.value };
                                  setTempSettings({ ...tempSettings, heroSlides: updated });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50 resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">অফারের বিস্তারিত বিবরণ (Subtitle)</label>
                              <textarea
                                rows={2}
                                value={slide.subtitleBn}
                                onChange={(e) => {
                                  const updated = [...arr];
                                  updated[sIndex] = { ...updated[sIndex], subtitleBn: e.target.value };
                                  setTempSettings({ ...tempSettings, heroSlides: updated });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold bg-neutral-50 resize-none"
                              />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">টার্গেট লিংক / সেকশন (Target)</label>
                                <select
                                  value={slide.targetAnchor || '#products'}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[sIndex] = { ...updated[sIndex], targetAnchor: e.target.value };
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold bg-neutral-50 cursor-pointer"
                                >
                                  <option value="#products">🥜 ড্রাই ফ্রুটস ও পণ্যসম্ভার (#products)</option>
                                  <option value="#clothing">👔 পোশাক সেকশন (#clothing)</option>
                                  <option value="#spices">🌶️ মসলা ও অর্গানিক ফুড (#spices)</option>
                                  <option value="#contact">📞 অর্ডার ও সহায়তা (#contact)</option>
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">ব্যানার ছবি আপলোড (Banner Image File or URL)</label>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                                    {slide.image ? (
                                      <img src={slide.image} alt="Slide Preview" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[9px] text-neutral-400 font-bold">ছবি নাই</span>
                                    )}
                                  </div>

                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="file"
                                        id={`slide-file-${sIndex}`}
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                              alert('ছবির সাইজ ৫ মেগাবাইট (5MB) এর কম হতে হবে');
                                              return;
                                            }
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                              const base64 = event.target?.result as string;
                                              if (base64) {
                                                const updated = [...arr];
                                                updated[sIndex] = { ...updated[sIndex], image: base64 };
                                                setTempSettings({ ...tempSettings, heroSlides: updated });
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="hidden"
                                      />
                                      <label
                                        htmlFor={`slide-file-${sIndex}`}
                                        className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] shadow-2xs transition-colors shrink-0"
                                      >
                                        <Upload className="w-3 h-3" />
                                        <span>ছবি আপলোড করুন</span>
                                      </label>
                                      {slide.image && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...arr];
                                            updated[sIndex] = { ...updated[sIndex], image: '' };
                                            setTempSettings({ ...tempSettings, heroSlides: updated });
                                          }}
                                          className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-650 font-bold text-[10px] cursor-pointer"
                                        >
                                          রিমুভ
                                        </button>
                                      )}
                                    </div>

                                    <input
                                      type="text"
                                      value={slide.image}
                                      onChange={(e) => {
                                        const updated = [...arr];
                                        updated[sIndex] = { ...updated[sIndex], image: e.target.value };
                                        setTempSettings({ ...tempSettings, heroSlides: updated });
                                      }}
                                      placeholder="অথবা সরাসরি ছবির URL লিঙ্ক দিন (https://...)"
                                      className="w-full px-2 py-1 rounded-lg border border-neutral-200 text-[11px] font-mono bg-neutral-50"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section Toggles */}
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        হোমপেজ সেকশন টগল (Show / Hide Sections)
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {[
                          { key: 'features', label: 'বৈশিষ্ট্য সেকশন (Features)' },
                          { key: 'about', label: 'আমাদের গল্প (About Us)' },
                          { key: 'services', label: 'প্রক্রিয়াজাতকরণ (Services)' },
                          { key: 'faq', label: 'প্রশ্নোত্তর (FAQ)' },
                          { key: 'testimonials', label: 'গ্রাহক রিভিউ (Testimonials)' },
                        ].map((sec) => {
                          const toggles = tempSettings.sectionToggles || { features: true, about: true, services: true, faq: true, testimonials: true, clothing: true, products: true };
                          const isOn = (toggles as any)[sec.key] !== false;
                          return (
                            <label key={sec.key} className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200 cursor-pointer shadow-2xs">
                              <span className="font-bold text-neutral-800">{sec.label}</span>
                              <input
                                type="checkbox"
                                checked={isOn}
                                onChange={(e) => {
                                  const updated = { ...toggles, [sec.key]: e.target.checked };
                                  setTempSettings({ ...tempSettings, sectionToggles: updated });
                                }}
                                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section Titles & Text Editor */}
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2 flex items-center justify-between">
                        <span>📝 সেকশনের শিরোনাম ও টেক্সট কাস্টমাইজেশন (Section Titles & Text Editor)</span>
                      </h4>

                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-medium text-neutral-700 mb-1">'আমাদের গল্প' সেকশনের শিরোনাম (About Title)</label>
                            <input
                              type="text"
                              value={tempSettings.aboutTitleBn || ''}
                              onChange={(e) => setTempSettings({ ...tempSettings, aboutTitleBn: e.target.value })}
                              placeholder="শতভাগ খাঁটি ও শতভাগ বিশুদ্ধ খাদ্যপণ্য সরবরাহে আমরা প্রতিজ্ঞাবদ্ধ"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-medium text-neutral-700 mb-1">'প্রক্রিয়াজাতকরণ' সেকশনের শিরোনাম (Services Title)</label>
                            <input
                              type="text"
                              value={tempSettings.spicesTitleBn || ''}
                              onChange={(e) => setTempSettings({ ...tempSettings, spicesTitleBn: e.target.value })}
                              placeholder="আমাদের আধুনিক প্রক্রিয়াজাতকরণ পদ্ধতি"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">'আমাদের গল্প' সেকশনের বিস্তারিত বর্ণনা (About Description)</label>
                          <textarea
                            rows={3}
                            value={tempSettings.aboutDescBn || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, aboutDescBn: e.target.value })}
                            placeholder="হালাল বাজার বিডি দেশের প্রতিটি ঘরে পুষ্টিকর, কেমিক্যালমুক্ত ও প্রাকৃতিক অর্গানিক খাদ্য পৌঁছে দেওয়ার জন্য কাজ করে..."
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">'প্রক্রিয়াজাতকরণ' সেকশনের বিবরণ (Services Description)</label>
                          <textarea
                            rows={2}
                            value={tempSettings.spicesDescBn || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, spicesDescBn: e.target.value })}
                            placeholder="হাইজিন ও স্বাস্থ্যবিধি মেনে প্রতিটি প্যাক প্রসেসিং ও প্যাকিং করা হয়..."
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-medium text-neutral-700 mb-1">'প্রশ্নোত্তর' সেকশন শিরোনাম (FAQ Title)</label>
                            <input
                              type="text"
                              value={tempSettings.faqTitleBn || ''}
                              onChange={(e) => setTempSettings({ ...tempSettings, faqTitleBn: e.target.value })}
                              placeholder="সাধারণ জিজ্ঞাসা ও উত্তর"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-medium text-neutral-700 mb-1">'যোগাযোগ' সেকশন শিরোনাম (Contact Title)</label>
                            <input
                              type="text"
                              value={tempSettings.contactTitleBn || ''}
                              onChange={(e) => setTempSettings({ ...tempSettings, contactTitleBn: e.target.value })}
                              placeholder="সরাসরি যোগাযোগ ও সহায়তা"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. THEME & APPEARANCE SETTINGS */}
                {activeTab === 'settings_appearance' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        কালার স্কিম ও স্টাইল (Color Scheme & Font)
                      </h4>

                      {/* Quick Preset Theme Buttons - REMOVED */}
                      <div className="hidden">
                        {/* Previously contained preset buttons */}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">কাস্টম কালার (Custom Primary Color)</label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={tempSettings.primaryColor || '#064e3b'}
                              onChange={(e) => setTempSettings({ ...tempSettings, primaryColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={tempSettings.primaryColor || '#064e3b'}
                              onChange={(e) => setTempSettings({ ...tempSettings, primaryColor: e.target.value })}
                              className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">ফন্ট স্টাইল (Font Family)</label>
                          <select
                            value={tempSettings.fontFamily || 'Inter, sans-serif'}
                            onChange={(e) => setTempSettings({ ...tempSettings, fontFamily: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                          >
                            <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                            <option value="'Hind Siliguri', sans-serif">Hind Siliguri (Bengali Modern)</option>
                            <option value="'Noto Serif Bengali', serif">Noto Serif (Classic Bengali)</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">কাস্টম সিএসএস (Custom CSS)</label>
                        <textarea
                          rows={4}
                          value={tempSettings.customCss || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, customCss: e.target.value })}
                          placeholder="/* Add your custom CSS styles here */"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-900 text-emerald-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SEO & SCRIPT SETTINGS */}
                {activeTab === 'settings_seo' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        গ্লোবাল এসইও অপ্টিমাইজেশন (Global SEO)
                      </h4>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">মেটা টাইটেল (Meta Title)</label>
                        <input
                          type="text"
                          value={tempSettings.metaTitle || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, metaTitle: e.target.value })}
                          placeholder="Halal Bazar BD - Pure Dry Fruits & Organic Food"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">মেটা ডিসক্রিপশন (Meta Description)</label>
                        <textarea
                          rows={2}
                          value={tempSettings.metaDescription || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, metaDescription: e.target.value })}
                          placeholder="100% pure organic dry fruits, honey and apparel with nationwide COD."
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">মেটা কিওয়ার্ডস (Keywords)</label>
                        <input
                          type="text"
                          value={tempSettings.metaKeywords || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, metaKeywords: e.target.value })}
                          placeholder="dry fruits, organic honey, panjabi, halal bazar bd"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        কাস্টম স্ক্রিপ্ট ইনপুট (Google Analytics, Pixel, GTM)
                      </h4>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">হেডার স্ক্রিপ্ট (&lt;head&gt; tags)</label>
                        <textarea
                          rows={3}
                          value={tempSettings.headerScript || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, headerScript: e.target.value })}
                          placeholder="<!-- Google Tag Manager / FB Pixel -->"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-900 text-emerald-400 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">ফুটার স্ক্রিপ্ট (Before &lt;/body&gt;)</label>
                        <textarea
                          rows={3}
                          value={tempSettings.footerScript || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, footerScript: e.target.value })}
                          placeholder="<!-- Custom JavaScript / Analytics -->"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-900 text-emerald-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ADMIN SECURITY & ROLES */}
                {activeTab === 'settings_security' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <h4 className="font-bold text-neutral-900 text-sm border-b border-neutral-200 pb-2">
                        এডমিন প্রোফাইল ও পাসওয়ার্ড পরিবর্তন
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">এডমিন নাম</label>
                          <input
                            type="text"
                            value={tempSettings.adminName || 'সুপার এডমিন'}
                            onChange={(e) => setTempSettings({ ...tempSettings, adminName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-neutral-700 mb-1">এডমিন ইমেইল</label>
                          <input
                            type="email"
                            value={tempSettings.adminEmail || 'admin@halalbazarbd.com'}
                            onChange={(e) => setTempSettings({ ...tempSettings, adminEmail: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">এডমিন পাসওয়ার্ড (Master Password)</label>
                        <input
                          type="text"
                          readOnly
                          value="tanvir88"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-100 font-mono font-bold text-neutral-900 cursor-not-allowed"
                        />
                        <p className="text-[11px] text-emerald-700 font-bold mt-1">✓ এডমিন প্যানেলের নির্ধারিত পাসওয়ার্ড: tanvir88</p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm sm:text-base flex items-center gap-2">
                            <Users className="w-4.5 h-4.5 text-indigo-600" />
                            <span>এডমিন ও ম্যানেজার ইউজার এক্সেস পারমিশন (Admin & Staff Access Manager)</span>
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            এডমিন প্যানেলে প্রবেশ করার জন্য অন্যান্য স্টাফ বা ম্যানেজারদের ইমেইল ও পাসওয়ার্ড এক্সেস দিন
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(!showAddUserModal)}
                          className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ নতুন এক্সেস ইউজার যুক্ত করুন</span>
                        </button>
                      </div>

                      {/* Add New User Form Box */}
                      {showAddUserModal && (
                        <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-3">
                          <h5 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-indigo-700" />
                            <span>নতুন ইউজারের ইমেইল ও পাসওয়ার্ড এক্সেস ইনফো দিন</span>
                          </h5>

                          <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700 mb-1">ইউজারের নাম (Name) *</label>
                              <input
                                type="text"
                                required
                                value={newUserForm.name}
                                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                placeholder="যেমন: আরিফুল ইসলাম"
                                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700 mb-1">লগইন ইমেইল (Login Email) *</label>
                              <input
                                type="email"
                                required
                                value={newUserForm.email}
                                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                placeholder="ariful@halalbazarbd.com"
                                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700 mb-1">লগইন পাসওয়ার্ড (Password) *</label>
                              <input
                                type="text"
                                required
                                value={newUserForm.password}
                                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                placeholder="যেমন: ariful123"
                                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-neutral-700 mb-1">এক্সেস রোল / পদবী (Role)</label>
                              <select
                                value={newUserForm.role}
                                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white cursor-pointer font-bold"
                              >
                                <option value="admin">সুপার এডমিন (Super Admin - Full Control)</option>
                                <option value="editor">ম্যানেজার (Manager - Orders & Stock)</option>
                                <option value="moderator">মডারেশন সাপোর্ট (Support Moderator)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200">
                            <button
                              type="button"
                              onClick={() => setShowAddUserModal(false)}
                              className="px-3 py-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                            >
                              বাতিল
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
                                  alert('অনুগ্রহ করে ইউজারের নাম, ইমেইল ও পাসওয়ার্ড প্রদান করুন');
                                  return;
                                }

                                const existingList = tempSettings.adminUsers || [
                                  { id: 'master-admin', name: tempSettings.adminName || 'সুপার এডমিন', email: tempSettings.adminEmail || 'admin@halalbazarbd.com', password: tempSettings.adminPassword || 'tanvir88', role: 'admin' },
                                  { id: 'usr-2', name: 'ম্যানেজার অ্যাকাউন্ট', email: 'manager@halalbazarbd.com', password: 'manager123', role: 'editor' },
                                  { id: 'usr-3', name: 'মডার্ন মডারেটর', email: 'mod@halalbazarbd.com', password: 'mod123', role: 'moderator' },
                                ];

                                const newUser = {
                                  id: `usr-${Date.now()}`,
                                  name: newUserForm.name.trim(),
                                  email: newUserForm.email.trim(),
                                  password: newUserForm.password.trim(),
                                  role: newUserForm.role,
                                };

                                setTempSettings({
                                  ...tempSettings,
                                  adminUsers: [...existingList, newUser],
                                });

                                setNewUserForm({ name: '', email: '', password: '', role: 'editor' });
                                setShowAddUserModal(false);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                              + ইউজার এক্সেস সেভ করুন
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Active Users List */}
                      <div className="space-y-2.5">
                        {(tempSettings.adminUsers && tempSettings.adminUsers.length > 0 ? tempSettings.adminUsers : [
                          { id: 'master-admin', name: tempSettings.adminName || 'সুপার এডমিন', email: tempSettings.adminEmail || 'admin@halalbazarbd.com', password: tempSettings.adminPassword || 'tanvir88', role: 'admin' as const },
                          { id: 'usr-2', name: 'ম্যানেজার অ্যাকাউন্ট', email: 'manager@halalbazarbd.com', password: 'manager123', role: 'editor' as const },
                          { id: 'usr-3', name: 'মডার্ন মডারেটর', email: 'mod@halalbazarbd.com', password: 'mod123', role: 'moderator' as const },
                        ]).map((u, i, arr) => (
                          <div key={u.id || i} className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-neutral-900 text-xs sm:text-sm">{u.name}</span>
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                  u.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                  u.role === 'editor' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                                  'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}>
                                  {u.role === 'admin' ? '👑 সুপার এডমিন' : u.role === 'editor' ? '👔 ম্যানেজার (Editor)' : '🛡️ মডারেটর'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-600 font-mono">
                                <span>📧 <b>ইমেইল:</b> {u.email}</span>
                                <span>🔑 <b>পাসওয়ার্ড:</b> <code className="bg-neutral-100 px-1.5 py-0.5 rounded border text-neutral-900 font-bold">{u.password || 'tanvir88'}</code></span>
                              </div>
                            </div>

                            {arr.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = arr.filter((_, idx) => idx !== i);
                                  setTempSettings({ ...tempSettings, adminUsers: updated });
                                }}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-red-200 shrink-0 self-start sm:self-center"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                                <span>মুছে ফেলুন</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. CUSTOM WEBSITE CONTENT & CARDS MANAGER */}
                {activeTab === 'settings_content_manager' && (
                  <div className="space-y-6">
                    {/* Features & Service Cards Manager */}
                    <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm sm:text-base flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span>১. কেন কেনাকাটা করবেন / বৈশিষ্ট্য ও সেবাসমূহ কার্ড এডিটর</span>
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            হোমপেজের মূল সার্ভিস ও বৈশিষ্ট্য কার্ডগুলো সরাসরি যোগ, এডিট বা কাস্টমাইজ করুন
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const current = tempSettings.customServices || [
                              { id: 'sp_s1', number: '01', titleBn: '১০০% খাঁটি ও প্রিমিয়াম ড্রাই ফ্রুটস ও বাদাম', descBn: 'সরাসরি বিশ্বসেরা বাগান থেকে সংগ্রহ করে স্বাস্থ্যকর উপায়ে এয়ারটাইট প্যাক করা।', metric: '১০০%', metricLabelBn: 'ভেজালমুক্ত ও খাঁটি' },
                              { id: 'sp_s2', number: '02', titleBn: 'প্রিমিয়াম ফেব্রিক ও আকর্ষণীয় পোশাক কালেকশন', descBn: '১০০% পিওর কম্বড কটন পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি ও পোশাক।', metric: '১০০%', metricLabelBn: 'কালার ও সাইজ গ্যারান্টি' },
                              { id: 'sp_s3', number: '03', titleBn: 'নিরাপদ প্যাকেজিং ও দ্রুত হোম ডেলিভারি', descBn: 'ফুড-গ্রেড এয়ারটাইট জিপলক প্যাকেজিং ও দ্রুততম ডেলিভারি সুবিধা।', metric: '২৪-৪৮ঘণ্টা', metricLabelBn: 'দ্রুততম ডেলিভারি' },
                            ];
                            const newCard = {
                              id: `srv-${Date.now()}`,
                              number: `0${current.length + 1}`,
                              titleBn: 'নতুন বৈশিষ্ট্য বা সেবার নাম লিখুন',
                              descBn: 'সেবা বা সুবিধার বিস্তারিত বর্ণনা এখানে দিন।',
                              metric: '১০০%',
                              metricLabelBn: 'গ্যারান্টিড মান',
                            };
                            setTempSettings({ ...tempSettings, customServices: [...current, newCard] });
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ নতুন কার্ড যোগ করুন</span>
                        </button>
                      </div>

                      <div className="grid gap-3.5">
                        {(tempSettings.customServices && tempSettings.customServices.length > 0 ? tempSettings.customServices : [
                          { id: 'sp_s1', number: '01', titleBn: '১০০% খাঁটি ও প্রিমিয়াম ড্রাই ফ্রুটস ও বাদাম', descBn: 'সরাসরি বিশ্বসেরা বাগান থেকে সংগ্রহ করে স্বাস্থ্যকর উপায়ে এয়ারটাইট প্যাক করা।', metric: '১০০%', metricLabelBn: 'ভেজালমুক্ত ও খাঁটি' },
                          { id: 'sp_s2', number: '02', titleBn: 'প্রিমিয়াম ফেব্রিক ও আকর্ষণীয় পোশাক কালেকশন', descBn: '১০০% পিওর কম্বড কটন পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি ও পোশাক।', metric: '১০০%', metricLabelBn: 'কালার ও সাইজ গ্যারান্টি' },
                          { id: 'sp_s3', number: '03', titleBn: 'নিরাপদ প্যাকেজিং ও দ্রুত হোম ডেলিভারি', descBn: 'ফুড-গ্রেড এয়ারটাইট জিপলক প্যাকেজিং ও দ্রুততম ডেলিভারি সুবিধা।', metric: '২৪-৪৮ঘণ্টা', metricLabelBn: 'দ্রুততম ডেলিভারি' },
                        ]).map((card, cIndex, arr) => (
                          <div key={card.id || cIndex} className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                              <span className="font-bold text-xs text-neutral-900 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black flex items-center justify-center font-mono">
                                  {card.number || cIndex + 1}
                                </span>
                                <span>কার্ড #{cIndex + 1}</span>
                              </span>
                              {arr.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = arr.filter((_, i) => i !== cIndex);
                                    setTempSettings({ ...tempSettings, customServices: updated });
                                  }}
                                  className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                                  <span>রিমুভ</span>
                                </button>
                              )}
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">কার্ড নম্বর (Serial/Number)</label>
                                <input
                                  type="text"
                                  value={card.number}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[cIndex] = { ...updated[cIndex], number: e.target.value };
                                    setTempSettings({ ...tempSettings, customServices: updated });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono bg-neutral-50"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">কার্ডের শিরোনাম (Card Title)</label>
                                <input
                                  type="text"
                                  value={card.titleBn}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[cIndex] = { ...updated[cIndex], titleBn: e.target.value };
                                    setTempSettings({ ...tempSettings, customServices: updated });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">কার্ডের বর্ণনা (Card Description)</label>
                              <textarea
                                rows={2}
                                value={card.descBn}
                                onChange={(e) => {
                                  const updated = [...arr];
                                  updated[cIndex] = { ...updated[cIndex], descBn: e.target.value };
                                  setTempSettings({ ...tempSettings, customServices: updated });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-neutral-50 resize-none"
                              />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">হাইলাইট ব্যাজ ভ্যালু (Metric Value)</label>
                                <input
                                  type="text"
                                  value={card.metric || ''}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[cIndex] = { ...updated[cIndex], metric: e.target.value };
                                    setTempSettings({ ...tempSettings, customServices: updated });
                                  }}
                                  placeholder="যেমন: ১০০% বা ২৪-৪৮ঘণ্টা"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">ব্যাজ লেবেল (Metric Label)</label>
                                <input
                                  type="text"
                                  value={card.metricLabelBn || ''}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[cIndex] = { ...updated[cIndex], metricLabelBn: e.target.value };
                                    setTempSettings({ ...tempSettings, customServices: updated });
                                  }}
                                  placeholder="যেমন: ভেজালমুক্ত ও খাঁটি"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQ Q&A Manager */}
                    <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm sm:text-base flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span>২. সচরাচর জিজ্ঞাসা ও উত্তর (FAQ Manager)</span>
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            গ্রাহকদের সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর এডিট করুন বা নতুন প্রশ্ন যুক্ত করুন
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentFaqs = tempSettings.customFaqs && tempSettings.customFaqs.length > 0 ? tempSettings.customFaqs : [
                              { id: 'sp_f1', questionBn: 'আপনাদের ড্রাই ফ্রুটস ও বাদাম শতভাগ সতেজ ও প্রিমিয়াম হওয়ার নিশ্চয়তা কী?', answerBn: 'আমাদের প্রতিটি ড্রাই ফ্রুটস ও বাদাম প্রিমিয়াম গ্রেডের এবং নতুন মৌসুমের তাজা স্টক। কোনো প্রকার কৃত্রিম রঙ বা কেমিক্যাল ব্যবহার করা হয় না।' },
                              { id: 'sp_f2', questionBn: 'পোশাকের সাইজ বা কালার পছন্দ না হলে কি এক্সচেঞ্জ করা যাবে?', answerBn: 'হ্যাঁ! পাঞ্জাবি বা পোশাকের সাইজে সমস্যা হলে ডেলিভারি পাওয়ার ৩ দিনের মধ্যে সম্পূর্ণ বিনামূল্যে সাইজ এক্সচেঞ্জ সুবিধা পাবেন।' },
                              { id: 'sp_f3', questionBn: 'ডেলিভারি চার্জ কত এবং কতদিনে পণ্য হাতে পাব?', answerBn: 'ঢাকার ভেতর ডেলিভারি চার্জ ৬০ টাকা (২৪-৪৮ ঘণ্টায়) এবং ঢাকার বাইরে ১২০ টাকা (২-৩ দিনে কুরিয়ারে)। ক্যাশ অন ডেলিভারিতে চেক করে মূল্য পরিশোধ করতে পারবেন।' },
                            ];
                            const newFaq = {
                              id: `faq-${Date.now()}`,
                              questionBn: 'আপনার নতুন প্রশ্ন এখানে লিখুন?',
                              answerBn: 'নতুন প্রশ্নের বিস্তারিত উত্তর এখানে প্রদান করুন।',
                            };
                            setTempSettings({ ...tempSettings, customFaqs: [...currentFaqs, newFaq] });
                          }}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ নতুন FAQ যোগ করুন</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(tempSettings.customFaqs && tempSettings.customFaqs.length > 0 ? tempSettings.customFaqs : [
                          { id: 'sp_f1', questionBn: 'আপনাদের ড্রাই ফ্রুটস ও বাদাম শতভাগ সতেজ ও প্রিমিয়াম হওয়ার নিশ্চয়তা কী?', answerBn: 'আমাদের প্রতিটি ড্রাই ফ্রুটস ও বাদাম প্রিমিয়াম গ্রেডের এবং নতুন মৌসুমের তাজা স্টক। কোনো প্রকার কৃত্রিম রঙ বা কেমিক্যাল ব্যবহার করা হয় না।' },
                          { id: 'sp_f2', questionBn: 'পোশাকের সাইজ বা কালার পছন্দ না হলে কি এক্সচেঞ্জ করা যাবে?', answerBn: 'হ্যাঁ! পাঞ্জাবি বা পোশাকের সাইজে সমস্যা হলে ডেলিভারি পাওয়ার ৩ দিনের মধ্যে সম্পূর্ণ বিনামূল্যে সাইজ এক্সচেঞ্জ সুবিধা পাবেন।' },
                          { id: 'sp_f3', questionBn: 'ডেলিভারি চার্জ কত এবং কতদিনে পণ্য হাতে পাব?', answerBn: 'ঢাকার ভেতর ডেলিভারি চার্জ ৬০ টাকা (২৪-৪৮ ঘণ্টায়) এবং ঢাকার বাইরে ১২০ টাকা (২-৩ দিনে কুরিয়ারে)। ক্যাশ অন ডেলিভারিতে চেক করে মূল্য পরিশোধ করতে পারবেন।' },
                        ]).map((faq, fIndex, arr) => (
                          <div key={faq.id || fIndex} className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                              <span className="font-bold text-xs text-neutral-900 font-mono">
                                FAQ #{fIndex + 1}
                              </span>
                              {arr.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = arr.filter((_, i) => i !== fIndex);
                                    setTempSettings({ ...tempSettings, customFaqs: updated });
                                  }}
                                  className="text-red-600 hover:bg-red-50 p-1 rounded text-xs font-bold cursor-pointer"
                                >
                                  ডিলিট
                                </button>
                              )}
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">প্রশ্ন (Question)</label>
                              <input
                                type="text"
                                value={faq.questionBn}
                                onChange={(e) => {
                                  const updated = [...arr];
                                  updated[fIndex] = { ...updated[fIndex], questionBn: e.target.value };
                                  setTempSettings({ ...tempSettings, customFaqs: updated });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">উত্তর (Answer)</label>
                              <textarea
                                rows={2}
                                value={faq.answerBn}
                                onChange={(e) => {
                                  const updated = [...arr];
                                  updated[fIndex] = { ...updated[fIndex], answerBn: e.target.value };
                                  setTempSettings({ ...tempSettings, customFaqs: updated });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-neutral-50 resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Testimonials Manager */}
                    <div className="p-4 sm:p-5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm sm:text-base flex items-center gap-2">
                            <MessageSquareQuote className="w-4 h-4 text-purple-600" />
                            <span>৩. গ্রাহক রিভিউ ও অভিজ্ঞতা (Customer Reviews Manager)</span>
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            গ্রাহকদের রিভিউ ও মতামতের তালিকা তৈরি ও এডিট করুন
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentTestimonials = tempSettings.customTestimonials || [
                              { id: 't-1', authorBn: 'রাফসান আহমেদ', roleBn: 'মিরপুর, ঢাকা', quoteBn: 'কাজুবাদাম ও কাঠবাদামের কোয়ালিটি অসাধারণ! প্যাকিংও অনেক ভালো লেগেছে।', rating: 5, productName: 'প্রিমিয়াম ড্রাই ফ্রুটস কম্বো' },
                              { id: 't-2', authorBn: 'তানভীর হাসান', roleBn: 'উত্তরা, ঢাকা', quoteBn: 'পাঞ্জাবির কাপড়ের কোয়ালিটি এবং সেলাই বেশ চমৎকার। সাইজও পারফেক্ট ছিল।', rating: 5, productName: 'প্রিমিয়াম কম্বড কটন পাঞ্জাবি' },
                            ];
                            const newRev = {
                              id: `rev-${Date.now()}`,
                              authorBn: 'নতুন গ্রাহকের নাম',
                              roleBn: 'লোকেশন / জেলা',
                              quoteBn: 'গ্রাহকের চমৎকার মতামতের বিবরণ এখানে লিখুন।',
                              rating: 5,
                              productName: 'পণ্যের নাম',
                            };
                            setTempSettings({ ...tempSettings, customTestimonials: [...currentTestimonials, newRev] });
                          }}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ নতুন রিভিউ যোগ করুন</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(tempSettings.customTestimonials && tempSettings.customTestimonials.length > 0 ? tempSettings.customTestimonials : [
                          { id: 't-1', authorBn: 'রাফসান আহমেদ', roleBn: 'মিরপুর, ঢাকা', quoteBn: 'কাজুবাদাম ও কাঠবাদামের কোয়ালিটি অসাধারণ! প্যাকিংও অনেক ভালো লেগেছে।', rating: 5, productName: 'প্রিমিয়াম ড্রাই ফ্রুটস কম্বো' },
                          { id: 't-2', authorBn: 'তানভীর হাসান', roleBn: 'উত্তরা, ঢাকা', quoteBn: 'পাঞ্জাবির কাপড়ের কোয়ালিটি এবং সেলাই বেশ চমৎকার। সাইজও পারফেক্ট ছিল।', rating: 5, productName: 'প্রিমিয়াম কম্বড কটন পাঞ্জাবি' },
                        ]).map((rev, rIndex, arr) => (
                          <div key={rev.id || rIndex} className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                              <span className="font-bold text-xs text-neutral-900">
                                রিভিউ #{rIndex + 1}
                              </span>
                              {arr.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = arr.filter((_, i) => i !== rIndex);
                                    setTempSettings({ ...tempSettings, customTestimonials: updated });
                                  }}
                                  className="text-red-600 hover:bg-red-50 p-1 rounded text-xs font-bold cursor-pointer"
                                >
                                  ডিলিট
                                </button>
                              )}
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">গ্রাহকের নাম (Author Name)</label>
                                <input
                                  type="text"
                                  value={rev.authorBn}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[rIndex] = { ...updated[rIndex], authorBn: e.target.value };
                                    setTempSettings({ ...tempSettings, customTestimonials: updated });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">অবস্থান/ঠিকানা (Location/Role)</label>
                                <input
                                  type="text"
                                  value={rev.roleBn || ''}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[rIndex] = { ...updated[rIndex], roleBn: e.target.value };
                                    setTempSettings({ ...tempSettings, customTestimonials: updated });
                                  }}
                                  placeholder="যেমন: ঢাকা"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-neutral-50"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">ক্রয়কৃত পণ্য (Product Name)</label>
                                <input
                                  type="text"
                                  value={rev.productName || ''}
                                  onChange={(e) => {
                                    const updated = [...arr];
                                    updated[rIndex] = { ...updated[rIndex], productName: e.target.value };
                                    setTempSettings({ ...tempSettings, customTestimonials: updated });
                                  }}
                                  placeholder="যেমন: ড্রাই ফ্রুটস কম্বো"
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-neutral-50"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">রিভিউ বক্তব্য (Review Quote)</label>
                              <textarea
                                rows={2}
                                value={rev.quoteBn}
                                onChange={(e) => {
                                  const updated = [...arr];
                                  updated[rIndex] = { ...updated[rIndex], quoteBn: e.target.value };
                                  setTempSettings({ ...tempSettings, customTestimonials: updated });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-neutral-50 resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Changes Button with Success Toast */}
                <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <Save className="w-4 h-4 text-amber-300" />
                    <span>সকল পরিবর্তন সংরক্ষণ করুন (Save Settings)</span>
                  </button>

                  {settingsSavedToast && (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs animate-bounce border border-emerald-300">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>সেটিংস সফলভাবে সেভ করা হয়েছে!</span>
                    </div>
                  )}
                </div>

              </form>
            </div>
          )}

          {/* Old Settings form hidden */}
          {false && (
            <div className="max-w-3xl bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    {activeTab === "settings_hero" && <><ImageIcon className="w-5 h-5 text-blue-600" /><span>হিরো ব্যানার ও সেকশন সেটিংস</span></>}
                    {activeTab === "settings_sections" && <><FileText className="w-5 h-5 text-emerald-600" /><span>ওয়েবসাইট সেকশন ও হেডার মেনু কন্টেন্ট</span></>}
                    {activeTab === "settings_payments" && <><Smartphone className="w-5 h-5 text-amber-600" /><span>বিকাশ ও নগদ পেমেন্ট গেটওয়ে সেটিংস</span></>}
                    {(activeTab === "settings_general" || activeTab === "settings") && <><Settings className="w-5 h-5 text-rose-600" /><span>সাধারণ স্টোর কনফিগারেশন</span></>}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {activeTab === "settings_hero" && "ওয়েবসাইটের প্রধান ব্যানার, আকর্ষণীয় ব্যাজ, হেডলাইন ও বাটন কাস্টমাইজ করুন"}
                    {activeTab === "settings_sections" && "ড্রাই ফ্রুটস, পোশাক ও আমাদের গল্প সেকশনের বিবরণ এবং হেডার মেনুবার নিয়ন্ত্রণ করুন"}
                    {activeTab === "settings_payments" && "গ্রাহকদের চেকআউটের জন্য বিকাশ ও নগদ মার্চেন্ট/পার্সোনাল অ্যাকাউন্ট ও নির্দেশাবলী"}
                    {(activeTab === "settings_general" || activeTab === "settings") && "লোগো, স্টোর নাম, কন্টাক্ট নম্বর, ঠিকানা ও ডেলিভারি ফি পরিবর্তন করুন"}
                  </p>
                </div>
              </div>

              {/* Sub-Tab Navigation Pills matching the sidebar options */}
              <div className="flex border border-neutral-200 gap-1.5 p-1 bg-neutral-100 rounded-xl overflow-x-auto shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab("settings_general")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    (activeTab === "settings_general" || activeTab === "settings")
                      ? "bg-white text-rose-900 shadow-xs border border-neutral-200/50 scale-102 font-black"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-rose-600" />
                  <span>সাধারণ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings_hero")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === "settings_hero"
                      ? "bg-white text-blue-900 shadow-xs border border-neutral-200/50 scale-102 font-black"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>হিরো সেকশন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings_sections")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === "settings_sections"
                      ? "bg-white text-emerald-900 shadow-xs border border-neutral-200/50 scale-102 font-black"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>সেকশন কন্টেন্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings_payments")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === "settings_payments"
                      ? "bg-white text-amber-900 shadow-xs border border-neutral-200/50 scale-102 font-black"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                  <span>পেমেন্ট গেটওয়ে</span>
                </button>
              </div>

              {settingsSavedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>সেটিংস সফলভাবে সেভ করা হয়েছে!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
                {/* TAB 1: GENERAL (Brand & Logo) */}
                {(activeTab === "settings_general" || activeTab === "settings") && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                  <h4 className="font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                    ১. ব্র্যান্ড ও লোগো পরিচয়
                  </h4>

                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-4 items-start">
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          স্টোরের নাম (Store Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={tempSettings.storeName}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, storeName: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">
                          লোগো ছবি আপলোড (Logo Upload)
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-neutral-200 shrink-0 flex items-center justify-center">
                            {tempSettings.logoImage ? (
                              <img src={tempSettings.logoImage} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-xs text-neutral-700">{tempSettings.storeName.charAt(0) || 'H'}</span>
                            )}
                          </div>
                          <input
                            type="file"
                            id="admin-logo-file-input"
                            accept="image/*"
                            onChange={handleLogoImageFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="admin-logo-file-input"
                            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-[11px] shadow-xs transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>ছবি দিন</span>
                          </label>
                          {tempSettings.logoImage && (
                            <button
                              type="button"
                              onClick={() => setTempSettings({ ...tempSettings, logoImage: undefined })}
                              className="px-2 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px]"
                            >
                              রিমুভ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">
                        ট্যাগলাইন বা স্লোগান
                      </label>
                      <input
                        type="text"
                        value={tempSettings.storeTagline}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, storeTagline: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                </div>
                )}

                {/* TAB 2: HERO SECTION */}
                {activeTab === "settings_hero" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                    <h4 className="font-bold text-neutral-900 flex items-center gap-2 text-sm">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span>২. হিরো সেকশন ও ব্যানার কাস্টমাইজেশন</span>
                    </h4>

                    {/* Segmented Tab Switcher for Dry Fruits vs Dedicated Clothing Hero */}
                    <div className="flex bg-neutral-100 p-1 rounded-xl gap-1 border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setHeroSettingsTab('dryfruits')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          heroSettingsTab === 'dryfruits'
                            ? 'bg-white text-amber-950 shadow-xs border border-neutral-200/80 font-black'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                        }`}
                      >
                        <span>🥜 ১. ড্রাই ফ্রুটস হিরো</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroSettingsTab('clothing')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          heroSettingsTab === 'clothing'
                            ? 'bg-white text-purple-950 shadow-xs border border-purple-200 font-black'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                        }`}
                      >
                        <span>👗 ২. পোশাক হিরো ও ব্যানার (আলাদা)</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. DRY FRUITS & MAIN HERO SETTINGS */}
                  {heroSettingsTab === 'dryfruits' && (
                    <div className="space-y-4 bg-neutral-50/80 p-4 rounded-xl border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                          <span>🥜 ড্রাই ফ্রুটস ও মূল স্টোর হিরো ব্যানার</span>
                        </span>
                        <span className="text-[10px] text-neutral-500 font-semibold bg-white px-2 py-0.5 rounded border border-neutral-200">
                          ডিফল্ট শপ ভিউ
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          হিরো টপ ব্যাজ (Top Badge)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.heroBadge || ''}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, heroBadge: e.target.value })
                          }
                          placeholder="যেমন: আমাদের বিশুদ্ধতা ও কোয়ালিটির নিশ্চয়তা"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          হিরো প্রধান শিরোনাম (Hero Title) *
                        </label>
                        <textarea
                          rows={2}
                          value={tempSettings.heroTitle}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, heroTitle: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">
                          হিরো সাবটাইটেল বা বিবরণ (Description) *
                        </label>
                        <textarea
                          rows={2}
                          value={tempSettings.heroSubtitle}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, heroSubtitle: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-neutral-700 mb-1">
                            প্রধান বাটন টেক্সট (CTA Text)
                          </label>
                          <input
                            type="text"
                            value={tempSettings.heroCtaText}
                            onChange={(e) =>
                              setTempSettings({ ...tempSettings, heroCtaText: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-neutral-700 mb-1">
                            হিরো ব্যানার ইমেজ (Hero Banner Image)
                          </label>
                          <div className="space-y-2">
                            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                              {tempSettings.heroImage ? (
                                <>
                                  <img src={tempSettings.heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setTempSettings({ ...tempSettings, heroImage: '' })}
                                    className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-red-650 hover:bg-red-700 text-white text-[10px] font-black shadow-md cursor-pointer transition-transform active:scale-95"
                                  >
                                    মুছে ফেলুন
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-neutral-400 font-medium">কোনো ছবি সিলেক্ট করা নেই (ডিফল্ট ব্যবহৃত হবে)</span>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <div>
                                <input
                                  type="file"
                                  id="admin-hero-file-input"
                                  accept="image/*"
                                  onChange={handleHeroImageFileChange}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="admin-hero-file-input"
                                  className="w-full h-8.5 cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[11px] shadow-xs transition-colors"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>ডিভাইস থেকে নতুন ছবি দিন</span>
                                </label>
                              </div>

                              <input
                                type="text"
                                placeholder="অথবা সরাসরি ছবির URL লিঙ্ক দিন"
                                value={tempSettings.heroImage}
                                onChange={(e) =>
                                  setTempSettings({ ...tempSettings, heroImage: e.target.value })
                                }
                                className="w-full h-8.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. DEDICATED SEPARATE CLOTHING HERO SETTINGS */}
                  {heroSettingsTab === 'clothing' && (
                    <div className="space-y-4 bg-purple-50/50 p-4 rounded-xl border border-purple-200/80">
                      <div className="flex items-center justify-between border-b border-purple-200/60 pb-2.5">
                        <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                          <span>👗 পোশাক কালেকশনের জন্য আলাদা হিরো সেকশন ও ব্যানার</span>
                        </span>
                        <span className="text-[10px] text-purple-800 font-bold bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                          পোশাক মোডে সক্রিয়
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">
                          পোশাক হিরো টপ ব্যাজ (Clothing Top Badge)
                        </label>
                        <input
                          type="text"
                          value={tempSettings.clothingHeroBadge || ''}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, clothingHeroBadge: e.target.value })
                          }
                          placeholder="যেমন: 👗 ১০০% প্রিমিয়াম সুতি ও ঐতিহ্যবাহী ফ্যাশন"
                          className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">
                          পোশাক হিরো প্রধান শিরোনাম (Clothing Hero Headline) *
                        </label>
                        <textarea
                          rows={2}
                          value={tempSettings.clothingHeroTitle || 'ঐতিহ্যবাহী ও আধুনিক প্রিমিয়াম পোশাক কালেকশন — আভিজাত্য ও ফ্যাশনের সেরা ঠিকানা'}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, clothingHeroTitle: e.target.value })
                          }
                          placeholder="পোশাক কালেকশনের প্রধান শিরোনাম লিখুন..."
                          className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-900 resize-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">
                          পোশাক হিরো সাবটাইটেল বা বিবরণ (Clothing Description) *
                        </label>
                        <textarea
                          rows={2}
                          value={tempSettings.clothingHeroSubtitle || 'রয়েল কটন এমব্রয়ডারি পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, প্রিমিয়াম বুটিক থ্রি-পিস, আরামদায়ক পোলো টি-শার্ট ও এক্সক্লুসিভ দুবাই বোরকা-হিজাবের চমৎকার কালেকশন।'}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, clothingHeroSubtitle: e.target.value })
                          }
                          placeholder="পোশাক কালেকশনের বিস্তারিত বিবরণ লিখুন..."
                          className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-900 resize-none"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block font-bold text-neutral-800 mb-1">
                              পোশাক বাটন টেক্সট (Clothing CTA Text)
                            </label>
                            <input
                              type="text"
                              value={tempSettings.clothingHeroCtaText || 'পোশাক কালেকশন দেখুন'}
                              onChange={(e) =>
                                setTempSettings({ ...tempSettings, clothingHeroCtaText: e.target.value })
                              }
                              placeholder="যেমন: পোশাক কালেকশন দেখুন"
                              className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-900 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-neutral-800 mb-1">
                              ভাসমান কোয়ালিটি ব্যাজ (Floating Badge)
                            </label>
                            <input
                              type="text"
                              value={tempSettings.clothingHeroFloatingBadge || '১০০% ফেব্রিক ও সাইজ গ্যারান্টি'}
                              onChange={(e) =>
                                setTempSettings({ ...tempSettings, clothingHeroFloatingBadge: e.target.value })
                              }
                              placeholder="যেমন: ১০০% ফেব্রিক ও সাইজ গ্যারান্টি"
                              className="w-full px-3 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-900 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-neutral-800 mb-1">
                            পোশাক হিরো ব্যানার ইমেজ (Clothing Banner Image)
                          </label>
                          <div className="space-y-2">
                            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-purple-200 flex items-center justify-center shadow-inner">
                              {(tempSettings.clothingHeroImage || tempSettings.clothingImage) ? (
                                <>
                                  <img
                                    src={tempSettings.clothingHeroImage || tempSettings.clothingImage}
                                    alt="Clothing Hero Preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setTempSettings({ ...tempSettings, clothingHeroImage: '', clothingImage: '' })}
                                    className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-red-650 hover:bg-red-700 text-white text-[10px] font-black shadow-md cursor-pointer transition-transform active:scale-95"
                                  >
                                    মুছে ফেলুন
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-neutral-400 font-medium">কোনো ছবি সিলেক্ট করা নেই (ডিফল্ট ব্যবহৃত হবে)</span>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <input
                                  type="file"
                                  id="admin-clothing-hero-file-input"
                                  accept="image/*"
                                  onChange={handleClothingHeroImageFileChange}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="admin-clothing-hero-file-input"
                                  className="flex-1 h-8.5 cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold text-[11px] shadow-xs transition-colors"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>নতুন ছবি আপলোড</span>
                                </label>

                                <button
                                  type="button"
                                  onClick={() => setTempSettings({
                                    ...tempSettings,
                                    clothingHeroImage: '/src/assets/images/hero_premium_apparel_1791006163359.jpg',
                                    clothingImage: '/src/assets/images/hero_premium_apparel_1791006163359.jpg'
                                  })}
                                  className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-900 text-[10px] font-bold cursor-pointer transition-colors"
                                  title="ডিফল্ট পোশাকে রিসেট করুন"
                                >
                                  ডিফল্ট ছবি
                                </button>
                              </div>

                              <input
                                type="text"
                                placeholder="অথবা পোশাক ছবির URL লিঙ্ক দিন"
                                value={tempSettings.clothingHeroImage || tempSettings.clothingImage || ''}
                                onChange={(e) =>
                                  setTempSettings({
                                    ...tempSettings,
                                    clothingHeroImage: e.target.value,
                                    clothingImage: e.target.value
                                  })
                                }
                                className="w-full h-8.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-900 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* TAB 1: GENERAL (Contact, Delivery, Social) */}
                {(activeTab === "settings_general" || activeTab === "settings") && (
                <>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                  <h4 className="font-bold text-neutral-900 border-b border-neutral-200 pb-2">
                    ৩. যোগাযোগ ও ডেলিভারি ফি
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">
                        মোবাইল / হেল্পলাইন নম্বর *
                      </label>
                      <input
                        type="text"
                        required
                        value={tempSettings.phone}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">
                        অফিশিয়াল ইমেইল *
                      </label>
                      <input
                        type="email"
                        required
                        value={tempSettings.email}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, email: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">
                        ঢাকার ভেতরে ডেলিভারি ফি (৳) *
                      </label>
                      <input
                        type="number"
                        required
                        value={tempSettings.deliveryFeeDhaka}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            deliveryFeeDhaka: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">
                        ঢাকার বাইরে ডেলিভারি ফি (৳) *
                      </label>
                      <input
                        type="number"
                        required
                        value={tempSettings.deliveryFeeOutside}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            deliveryFeeOutside: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      অফিস বা ওয়্যারহাউজ ঠিকানা
                    </label>
                    <input
                      type="text"
                      value={tempSettings.address}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, address: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      ফুটার কপিরাইট টেক্সট
                    </label>
                    <input
                      type="text"
                      value={tempSettings.footerText}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, footerText: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                {/* 3. Invoice & Order Serial Number Settings */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/40 via-neutral-50 to-emerald-50/20 border border-emerald-200 space-y-4">
                  <h4 className="font-bold text-neutral-900 border-b border-emerald-200/80 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-950">
                      <Receipt className="w-4 h-4 text-emerald-700" />
                      <span>৩. ইনভয়েস ও মেমো ক্রমিক নম্বর সেটিংস (Invoice Serial Settings)</span>
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      বর্তমানে পরবর্তী নম্বর: #{tempSettings.nextInvoiceNumber || 1}
                    </span>
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-emerald-950">
                          পরবর্তী ইনভয়েস শুরুর সিরিয়াল নম্বর (Next Invoice Number) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setTempSettings({ ...tempSettings, nextInvoiceNumber: 1 })}
                          className="text-[10px] text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                          title="সিরিয়াল ১-এ রিসেট করুন"
                        >
                          ↺ ১ থেকে রিসেট
                        </button>
                      </div>
                      <input
                        type="number"
                        min="1"
                        required
                        value={tempSettings.nextInvoiceNumber || 1}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            nextInvoiceNumber: Math.max(1, parseInt(e.target.value, 10) || 1),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-emerald-400 bg-white font-mono font-bold text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
                        placeholder="যেমন: 1"
                      />
                      <p className="text-[10.5px] text-neutral-600 mt-1">
                        নতুন কোনো অর্ডার আসলে ইনভয়েস ও মেমো একদম ১ থেকে ক্রমান্বয়ে শুরু হবে (১, ২, ৩...)।
                      </p>
                    </div>

                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">
                        ইনভয়েস প্রিফিক্স / কোড (Invoice Prefix - Optional)
                      </label>
                      <input
                        type="text"
                        value={tempSettings.invoicePrefix !== undefined ? tempSettings.invoicePrefix : 'INV-'}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            invoicePrefix: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white font-mono font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                        placeholder="যেমন: INV- বা HB-"
                      />
                      <p className="text-[10.5px] text-neutral-500 mt-1">
                        উদাহরণ: <strong>INV-</strong> দিলে <strong>INV-0001</strong> আসবে। ফাঁকা রাখলে শুধু ১, ২, ৩ আসবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Social Media & Customer Contact Links Settings */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-4">
                  <h4 className="font-bold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>৪. সোশ্যাল মিডিয়া ও কাস্টমার কন্টাক্ট লিঙ্ক (Facebook & WhatsApp)</span>
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1 flex items-center justify-between">
                        <span>ফেইসবুক পেইজ লিঙ্ক (Facebook Page URL)</span>
                        {tempSettings.facebookUrl && (
                          <button
                            type="button"
                            onClick={() => setTempSettings({ ...tempSettings, facebookUrl: '' })}
                            className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                          >
                            মুছে ফেলুন (Delete)
                          </button>
                        )}
                      </label>
                      <input
                        type="url"
                        placeholder="যেমন: https://facebook.com/yourpage"
                        value={tempSettings.facebookUrl || ''}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, facebookUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1">
                        ফাঁকা রাখলে বা ডিলিট করলে ওয়েবসাইটে ডিফল্ট লিঙ্ক ব্যবহৃত হবে।
                      </p>
                    </div>

                    <div>
                      <label className="block font-medium text-neutral-700 mb-1 flex items-center justify-between">
                        <span>হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)</span>
                        {tempSettings.whatsappNumber && (
                          <button
                            type="button"
                            onClick={() => setTempSettings({ ...tempSettings, whatsappNumber: '' })}
                            className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                          >
                            মুছে ফেলুন (Delete)
                          </button>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: 01711889900"
                        value={tempSettings.whatsappNumber || ''}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1">
                        গ্রাহকরা এই হোয়াটসঅ্যাপ নম্বরে সরাসরি চ্যাট করতে পারবেন। ফাঁকা রাখলে প্রধান হটলাইন ব্যবহৃত হবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Inventory & Low Stock Alert Settings */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/50 via-neutral-50 to-orange-50/30 border border-amber-300 space-y-4">
                  <h4 className="font-bold text-neutral-900 border-b border-amber-200 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-950">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>৫. ইনভেন্টরি ও লো-স্টক সতর্কতা সীমা (Low Stock Threshold)</span>
                    </span>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      বর্তমানে: {tempSettings.lowStockThreshold || 5} ইউনিট
                    </span>
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block font-medium text-neutral-700 mb-1">
                        স্বয়ংক্রিয় সতর্কবার্তা সীমা (Alert Threshold) *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          required
                          value={tempSettings.lowStockThreshold !== undefined ? tempSettings.lowStockThreshold : 5}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              lowStockThreshold: Math.max(1, parseInt(e.target.value, 10) || 5),
                            })
                          }
                          className="w-32 px-3 py-2 rounded-lg border border-amber-300 bg-white font-mono font-bold text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                        <span className="text-xs font-semibold text-neutral-600">ইউনিট বা পিস</span>
                      </div>
                      <p className="text-[10.5px] text-neutral-500 mt-1">
                        পণ্যের স্টক এই পরিমাণের সমান বা নিচে নামলে ড্যাশবোর্ডে অ্যালার্ট ও দ্রুত রিস্টক অ্যাকশন দেখাবে।
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                        দ্রুত প্রিসেট বাটন:
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[3, 5, 10, 15, 20].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setTempSettings({ ...tempSettings, lowStockThreshold: preset })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                              (tempSettings.lowStockThreshold || 5) === preset
                                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-amber-400'
                            }`}
                          >
                            {preset} ইউনিট
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Auto Deduct on Order Toggle */}
                  <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="block font-bold text-neutral-900 text-xs">
                        অর্ডারে স্বয়ংক্রিয় স্টক হ্রাস (Auto-Deduct Stock on Order):
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {tempSettings.autoDeductStockOnOrder
                          ? 'অন: কাস্টমার অর্ডার সাবমিট করলে স্বয়ংক্রিয়ভাবে স্টক কমবে।'
                          : 'বন্ধ (ডিফল্ট): কাস্টমার অর্ডারে স্টক স্বয়ংক্রিয়ভাবে কমবে না; অ্যাডমিন নিজে যাচাই করে স্টক কমাবেন।'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTempSettings({ ...tempSettings, autoDeductStockOnOrder: !tempSettings.autoDeductStockOnOrder })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        tempSettings.autoDeductStockOnOrder
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      {tempSettings.autoDeductStockOnOrder ? '🟢 অটো হ্রাস চালু' : '⚪ ম্যানুয়াল স্টক কন্ট্রোল (বন্ধ)'}
                    </button>
                  </div>
                </div>
                </>
                )}

                {/* TAB 4: PAYMENTS */}
                {activeTab === "settings_payments" && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 via-pink-50/20 to-orange-50/20 border border-neutral-200 space-y-4">
                  <div className="border-b border-neutral-200 pb-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-700" />
                        <span>৫. বিকাশ ও নগদ পেমেন্ট সেটিংস (bKash & Nagad Accounts)</span>
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        কাস্টমার চেকআউট করার সময় এই নম্বর ও একাউন্ট টাইপ দেখতে পাবে
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* bKash Settings */}
                    <div className="p-3 rounded-xl bg-pink-50/60 border border-pink-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-pink-700 text-sm">বিকাশ (bKash) সেটিংস</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-200 text-pink-900">
                          বিকাশ
                        </span>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 text-xs mb-1">
                          বিকাশ নম্বর *
                        </label>
                        <input
                          type="text"
                          value={tempSettings.bkashNumber || ''}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, bkashNumber: e.target.value })
                          }
                          placeholder="যেমন: 01711-889900"
                          className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-pink-600"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 text-xs mb-1">
                          একাউন্ট টাইপ
                        </label>
                        <select
                          value={tempSettings.bkashType || 'personal'}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              bkashType: e.target.value as 'personal' | 'merchant' | 'agent',
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-pink-300 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-pink-600 cursor-pointer"
                        >
                          <option value="personal">Personal (Send Money / ক্যাশ ইন)</option>
                          <option value="merchant">Merchant (Make Payment)</option>
                          <option value="agent">Agent (ক্যাশ ইন / পেমেন্ট)</option>
                        </select>
                      </div>
                    </div>

                    {/* Nagad Settings */}
                    <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-orange-700 text-sm">নগদ (Nagad) সেটিংস</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-200 text-orange-900">
                          নগদ
                        </span>
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 text-xs mb-1">
                          নগদ নম্বর *
                        </label>
                        <input
                          type="text"
                          value={tempSettings.nagadNumber || ''}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, nagadNumber: e.target.value })
                          }
                          placeholder="যেমন: 01811-889900"
                          className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-orange-600"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-neutral-700 text-xs mb-1">
                          একাউন্ট টাইপ
                        </label>
                        <select
                          value={tempSettings.nagadType || 'personal'}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              nagadType: e.target.value as 'personal' | 'merchant' | 'agent',
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-orange-300 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-600 cursor-pointer"
                        >
                          <option value="personal">Personal (Send Money / ক্যাশ ইন)</option>
                          <option value="merchant">Merchant (Make Payment)</option>
                          <option value="agent">Agent (ক্যাশ ইন / পেমেন্ট)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* TAB 3: SECTIONS & NAVIGATION */}
                {activeTab === "settings_sections" && (
                <>
                <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 via-emerald-50/20 to-neutral-50 border border-neutral-200 space-y-4">
                  <div className="border-b border-neutral-200 pb-2 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                        <span>৫. হেডার মেনুবার কাস্টমাইজেশন (Header Navigation Bar)</span>
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        এডমিন এখান থেকে হেডার মেনুর যেকোনো অপশন নাম পরিবর্তন, লিংক সেট, রি-অর্ডার বা নতুন অপশন যুক্ত করতে পারবেন
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const defaultNavs = [
                            { id: 'about', labelBn: 'বিশুদ্ধতা', labelEn: 'Purity', href: '#about' },
                            { id: 'products', labelBn: 'ড্রাই ফ্রুটস ও পণ্যসম্ভার', labelEn: 'Dry Fruits & Pantry', href: '#products' },
                            { id: 'clothing', labelBn: 'পোশাক', labelEn: 'Clothing', href: '#clothing' },
                            { id: 'services', labelBn: 'প্রক্রিয়াজাতকরণ', labelEn: 'Processing', href: '#services' },
                            { id: 'faq', labelBn: 'প্রশ্নোত্তর', labelEn: 'FAQ', href: '#faq' },
                            { id: 'contact', labelBn: 'অর্ডার ও সহায়তা', labelEn: 'Support', href: '#contact' },
                          ];
                          setTempSettings({ ...tempSettings, navItems: defaultNavs });
                        }}
                        className="px-2.5 py-1 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="ডিফল্ট মূল মেনু রিসেট করুন"
                      >
                        ↺ মূল মেনু রিসেট
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newItem = {
                            id: `nav-${Date.now()}`,
                            labelBn: 'নতুন অপশন',
                            labelEn: 'New Option',
                            href: '#products',
                          };
                          setTempSettings({
                            ...tempSettings,
                            navItems: [...(tempSettings.navItems || []), newItem],
                          });
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ নতুন অপশন যোগ করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-time Header Menu Preview */}
                  <div className="p-3 bg-white rounded-xl border border-neutral-200/90 space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      লাইভ মেনুবার প্রিভিউ (Live Header Preview)
                    </span>
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {(tempSettings.navItems || []).map((nav, idx) => (
                        <span
                          key={nav.id || idx}
                          className="px-3 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 font-bold text-xs shadow-2xs"
                        >
                          {nav.labelBn || 'খালি অপশন'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Menu Items List with Reordering & Custom Section Anchor Picker */}
                  <div className="space-y-2.5">
                    {(tempSettings.navItems || []).map((nav, index) => {
                      const isFirst = index === 0;
                      const isLast = index === (tempSettings.navItems || []).length - 1;

                      return (
                        <div
                          key={nav.id || index}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs hover:border-emerald-300 transition-colors"
                        >
                          {/* Order Number Badge & Move Up/Down Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center font-mono">
                              {index + 1}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => {
                                  if (isFirst) return;
                                  const updated = [...(tempSettings.navItems || [])];
                                  const temp = updated[index - 1];
                                  updated[index - 1] = updated[index];
                                  updated[index] = temp;
                                  setTempSettings({ ...tempSettings, navItems: updated });
                                }}
                                className="text-[9px] font-black text-neutral-500 hover:text-emerald-800 disabled:opacity-20 cursor-pointer"
                                title="উপরে তুলুন"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => {
                                  if (isLast) return;
                                  const updated = [...(tempSettings.navItems || [])];
                                  const temp = updated[index + 1];
                                  updated[index + 1] = updated[index];
                                  updated[index] = temp;
                                  setTempSettings({ ...tempSettings, navItems: updated });
                                }}
                                className="text-[9px] font-black text-neutral-500 hover:text-emerald-800 disabled:opacity-20 cursor-pointer"
                                title="নিচে নামান"
                              >
                                ▼
                              </button>
                            </div>
                          </div>

                          {/* Menu Label Input (Bengali) */}
                          <div className="flex-1 min-w-[140px]">
                            <label className="block text-[9.5px] text-neutral-400 font-bold mb-0.5">
                              মেনুর নাম (Label)
                            </label>
                            <input
                              type="text"
                              value={nav.labelBn}
                              onChange={(e) => {
                                const updated = [...(tempSettings.navItems || [])];
                                updated[index] = {
                                  ...updated[index],
                                  labelBn: e.target.value,
                                  labelEn: e.target.value,
                                };
                                setTempSettings({ ...tempSettings, navItems: updated });
                              }}
                              placeholder="যেমন: ড্রাই ফ্রুটস ও পণ্যসম্ভার"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>

                          {/* Target Section Anchor Selector */}
                          <div className="w-full sm:w-48">
                            <label className="block text-[9.5px] text-neutral-400 font-bold mb-0.5">
                              ক্লিক করলে যেখানে যাবে (Target)
                            </label>
                            <select
                              value={nav.href}
                              onChange={(e) => {
                                const updated = [...(tempSettings.navItems || [])];
                                updated[index] = { ...updated[index], href: e.target.value };
                                setTempSettings({ ...tempSettings, navItems: updated });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold bg-neutral-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                            >
                              <option value="#about">🌱 বিশুদ্ধতা সেকশন (#about)</option>
                              <option value="#products">🥜 ড্রাই ফ্রুটস ও পণ্যসম্ভার (#products)</option>
                              <option value="#clothing">👔 পোশাক সেকশন (#clothing)</option>
                              <option value="#services">⚙️ প্রক্রিয়াজাতকরণ (#services)</option>
                              <option value="#faq">❓ প্রশ্নোত্তর সেকশন (#faq)</option>
                              <option value="#contact">📞 অর্ডার ও সহায়তা (#contact)</option>
                            </select>
                          </div>

                          {/* Delete Item Button */}
                          <div className="shrink-0 pt-3">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (tempSettings.navItems || []).filter((_, i) => i !== index);
                                setTempSettings({ ...tempSettings, navItems: updated });
                              }}
                              className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              title="এই অপশনটি মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Main Product Category Navigation Bar Customization (প্রধান ক্যাটাগরি মেনুবার) */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-800 text-white space-y-4 shadow-md">
                  <div className="border-b border-emerald-800/80 pb-2 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                        <span>✨ ৬. প্রধান প্রোডাক্ট ক্যাটাগরি মেনুবার কাস্টমাইজেশন (Category Navigation Bar)</span>
                      </h4>
                      <p className="text-[11px] text-emerald-200 mt-0.5">
                        হেডারের নিচের ক্যাটাগরি মেনুর নাম (যেমন: dress, honey, ghee, nuts & seeds ইত্যাদি), ইমোজি ও ট্যাগ সহজে পরিবর্তন বা যোগ করুন
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTempSettings({ ...tempSettings, categoryNavItems: DEFAULT_CATEGORY_NAV_ITEMS });
                        }}
                        className="px-2.5 py-1 rounded-lg border border-emerald-700 bg-emerald-900 text-emerald-200 hover:bg-emerald-800 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                        title="ডিফল্ট ক্যাটাগরি মেনু রিসেট করুন"
                      >
                        ↺ ডিফল্ট ক্যাটাগরি রিসেট
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newCatItem: CategoryNavItem = {
                            id: `cat-${Date.now()}`,
                            labelBn: 'নতুন ক্যাটাগরি',
                            labelEn: 'New Category',
                            categoryKey: 'all',
                            icon: '🛍️',
                            badge: '',
                          };
                          const currentCats = tempSettings.categoryNavItems || DEFAULT_CATEGORY_NAV_ITEMS;
                          setTempSettings({
                            ...tempSettings,
                            categoryNavItems: [...currentCats, newCatItem],
                          });
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-[11px] font-black shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-neutral-950" />
                        <span>+ নতুন ক্যাটাগরি যোগ</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-time Category Menu Preview */}
                  <div className="p-3 bg-emerald-900/60 rounded-xl border border-emerald-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                      লাইভ ক্যাটাগরি বার প্রিভিউ (Live Preview)
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(tempSettings.categoryNavItems || DEFAULT_CATEGORY_NAV_ITEMS).map((cat, idx) => (
                        <span
                          key={cat.id || idx}
                          className="px-2.5 py-1 rounded-lg bg-emerald-800/90 border border-emerald-700 text-emerald-100 font-bold text-xs flex items-center gap-1 shadow-2xs"
                        >
                          {cat.icon && <span>{cat.icon}</span>}
                          <span>{cat.labelBn}</span>
                          {cat.badge && (
                            <span className="bg-amber-400 text-neutral-950 text-[9px] font-black px-1 py-0.2 rounded-full">
                              {cat.badge}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category Items List with Edit Inputs, Emojis, and Reordering */}
                  <div className="space-y-2.5">
                    {(tempSettings.categoryNavItems || DEFAULT_CATEGORY_NAV_ITEMS).map((cat, index) => {
                      const currentCats = tempSettings.categoryNavItems || DEFAULT_CATEGORY_NAV_ITEMS;
                      const isFirst = index === 0;
                      const isLast = index === currentCats.length - 1;

                      return (
                        <div
                          key={cat.id || index}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white text-neutral-900 p-3 rounded-xl border border-neutral-200 shadow-2xs hover:border-amber-400 transition-colors"
                        >
                          {/* Order Badge & Reorder Arrows */}
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black flex items-center justify-center font-mono">
                              {index + 1}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => {
                                  if (isFirst) return;
                                  const updated = [...currentCats];
                                  const temp = updated[index - 1];
                                  updated[index - 1] = updated[index];
                                  updated[index] = temp;
                                  setTempSettings({ ...tempSettings, categoryNavItems: updated });
                                }}
                                className="text-[9px] font-black text-neutral-500 hover:text-emerald-800 disabled:opacity-20 cursor-pointer"
                                title="উপরে তুলুন"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => {
                                  if (isLast) return;
                                  const updated = [...currentCats];
                                  const temp = updated[index + 1];
                                  updated[index + 1] = updated[index];
                                  updated[index] = temp;
                                  setTempSettings({ ...tempSettings, categoryNavItems: updated });
                                }}
                                className="text-[9px] font-black text-neutral-500 hover:text-emerald-800 disabled:opacity-20 cursor-pointer"
                                title="নিচে নামান"
                              >
                                ▼
                              </button>
                            </div>
                          </div>

                          {/* Icon / Emoji Input */}
                          <div className="w-14 shrink-0">
                            <label className="block text-[9px] text-neutral-400 font-bold mb-0.5">আইকন</label>
                            <input
                              type="text"
                              value={cat.icon || ''}
                              onChange={(e) => {
                                const updated = [...currentCats];
                                updated[index] = { ...updated[index], icon: e.target.value };
                                setTempSettings({ ...tempSettings, categoryNavItems: updated });
                              }}
                              placeholder="🛍️"
                              className="w-full text-center px-1.5 py-1.5 rounded-lg border border-neutral-200 text-sm font-bold bg-neutral-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>

                          {/* Category Label (Bengali) */}
                          <div className="flex-1 min-w-[140px]">
                            <label className="block text-[9px] text-neutral-400 font-bold mb-0.5">ক্যাটাগরির নাম (Label)</label>
                            <input
                              type="text"
                              value={cat.labelBn}
                              onChange={(e) => {
                                const updated = [...currentCats];
                                updated[index] = {
                                  ...updated[index],
                                  labelBn: e.target.value,
                                  labelEn: e.target.value,
                                };
                                setTempSettings({ ...tempSettings, categoryNavItems: updated });
                              }}
                              placeholder="যেমন: পোশাক ও ফ্যাশন (Dress)"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>

                          {/* Target Filter Key */}
                          <div className="w-full sm:w-36">
                            <label className="block text-[9px] text-neutral-400 font-bold mb-0.5">ফিল্টার কী (Category)</label>
                            <select
                              value={cat.categoryKey}
                              onChange={(e) => {
                                const updated = [...currentCats];
                                updated[index] = { ...updated[index], categoryKey: e.target.value };
                                setTempSettings({ ...tempSettings, categoryNavItems: updated });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold bg-neutral-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                            >
                              <option value="all">🛍️ সব পণ্য (All)</option>
                              <option value="dress">👗 পোশাক / Dress</option>
                              <option value="honey">🍯 মধু / Honey</option>
                              <option value="ghee">🧈 ঘি ও তেল / Ghee</option>
                              <option value="nuts">🥜 বাদাম / Nuts & Seeds</option>
                              <option value="dates">🌴 খেজুর / Dates</option>
                              <option value="panjabi">👔 পাঞ্জাবি / Panjabi</option>
                              <option value="saree">✨ শাড়ি ও থ্রি-পিস / Saree</option>
                              <option value="clothing">👗 প্রিমিয়াম পোশাক</option>
                              <option value="offers">🔥 বিশেষ অফার / Offers</option>
                            </select>
                          </div>

                          {/* Badge Text (Optional) */}
                          <div className="w-24 shrink-0">
                            <label className="block text-[9px] text-neutral-400 font-bold mb-0.5">ট্যাগ/ব্যাজ</label>
                            <input
                              type="text"
                              value={cat.badge || ''}
                              onChange={(e) => {
                                const updated = [...currentCats];
                                updated[index] = { ...updated[index], badge: e.target.value };
                                setTempSettings({ ...tempSettings, categoryNavItems: updated });
                              }}
                              placeholder="হট / নতুন"
                              className="w-full px-2 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </div>

                          {/* Delete Item Button */}
                          <div className="shrink-0 pt-3">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentCats.filter((_, i) => i !== index);
                                setTempSettings({ ...tempSettings, categoryNavItems: updated });
                              }}
                              className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              title="এই ক্যাটাগরি অপশনটি মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 7. Section Titles & Descriptions Customization */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 via-emerald-50/20 to-neutral-50 border border-neutral-200 space-y-4">
                  <h4 className="font-bold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center justify-between">
                    <span>৭. ওয়েবসাইট সেকশনসমূহের শিরোনাম ও বর্ণনা সম্পাদনা</span>
                  </h4>

                  <div className="space-y-3.5">
                    {/* Spices Title & Description */}
                    <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-2">
                      <label className="block font-bold text-amber-950 text-xs">
                        🥜 ড্রাই ফ্রুটস ও খাদ্যপণ্য সেকশন শিরোনাম ও ডিসক্রিপশন
                      </label>
                      <input
                        type="text"
                        value={tempSettings.spicesTitleBn || '🥜 প্রিমিয়াম ড্রাই ফ্রুটস ও অর্গানিক খাদ্যপণ্য কর্নার'}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, spicesTitleBn: e.target.value })
                        }
                        placeholder="ড্রাই ফ্রুটস সেকশনের শিরোনাম"
                        className="w-full px-3 py-1.5 rounded border border-neutral-200 text-xs bg-neutral-50 focus:bg-white font-bold"
                      />
                      <textarea
                        rows={2}
                        value={tempSettings.spicesDescBn || 'সৌদি মদিনার খাঁটি আজওয়া ও মরিয়ম খেজুর, প্রিমিয়াম কাজুবাদাম, কাঠবাদাম, পেস্তা, কিশমিশ, চিয়া সিড, সুন্দরবনের চাকের মধু ও খাঁটি গাওয়া ঘি।'}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, spicesDescBn: e.target.value })
                        }
                        placeholder="ড্রাই ফ্রুটস সেকশনের বর্ণনা"
                        className="w-full px-3 py-1.5 rounded border border-neutral-200 text-xs bg-neutral-50 focus:bg-white resize-none"
                      />

                      {/* Section Thumbnail Uploader */}
                      <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-[11px]">
                        <span className="font-bold text-neutral-600 block">ড্রাই ফ্রুটস সেকশন থাম্বনেইল ছবি (Dry Fruits Section Thumbnail):</span>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 shadow-2xs">
                            {tempSettings.spicesImage ? (
                              <img src={tempSettings.spicesImage} alt="Dry Fruits" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-amber-800 font-extrabold text-[10px]">🥜</span>
                            )}
                          </div>
                          <div className="flex-1 flex items-center gap-1.5">
                            <input
                              type="file"
                              id="admin-spices-thumb-input"
                              accept="image/*"
                              onChange={handleSpicesImageFileChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="admin-spices-thumb-input"
                              className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] shadow-2xs"
                            >
                              <Upload className="w-3 h-3" />
                              <span>ছবি আপলোড</span>
                            </label>
                            {tempSettings.spicesImage && (
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setTempSettings({ ...tempSettings, spicesImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80' })}
                                  className="px-2 py-1.5 rounded-lg border border-amber-200 text-amber-950 bg-amber-50 hover:bg-amber-100 font-bold cursor-pointer"
                                  title="ডিফল্ট ড্রাই ফ্রুটস ছবিতে রিসেট করুন"
                                >
                                  ডিফল্ট ছবি দিন
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTempSettings({ ...tempSettings, spicesImage: '' })}
                                  className="px-2 py-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 font-bold cursor-pointer"
                                >
                                  ডিলিট
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clothing Title & Description */}
                    <div className="p-3 bg-white rounded-lg border border-purple-200 space-y-2">
                      <label className="block font-bold text-purple-950 text-xs">
                        👗 পোশাক সেকশন শিরোনাম ও ডিসক্রিপশন
                      </label>
                      <input
                        type="text"
                        value={tempSettings.clothingTitleBn || '👗 প্রিমিয়াম পোশাক ও ট্রেন্ডি ফ্যাশন গ্যালারি'}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, clothingTitleBn: e.target.value })
                        }
                        placeholder="পোশাক সেকশনের শিরোনাম"
                        className="w-full px-3 py-1.5 rounded border border-neutral-200 text-xs bg-neutral-50 focus:bg-white font-bold"
                      />
                      <textarea
                        rows={2}
                        value={tempSettings.clothingDescBn || 'উৎসব ও দৈনন্দিন ব্যবহারের জন্য আমাদের নিজস্ব তাঁতি ও কারিগরদের বোনা রয়েল কটন এমব্রয়ডারি পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, বুটিক থ্রি-পিস, পোলো টি-শার্ট ও ইমপোর্টেড দুবাই বোরকা-হিজাব সেট।'}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, clothingDescBn: e.target.value })
                        }
                        placeholder="পোশাক সেকশনের বর্ণনা"
                        className="w-full px-3 py-1.5 rounded border border-neutral-200 text-xs bg-neutral-50 focus:bg-white resize-none"
                      />

                      {/* Clothing Key Selling Points Customization */}
                      <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-[11px]">
                        <span className="font-bold text-neutral-600 block">পোশাক সেকশন ফিচার পয়েন্ট (৩টি):</span>
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex gap-1.5">
                            <input
                              type="text"
                              value={tempSettings.clothingFeatures?.[i]?.title || ''}
                              onChange={(e) => {
                                const newFeatures = [...(tempSettings.clothingFeatures || [{title:'', desc:''}, {title:'', desc:''}, {title:'', desc:''}])];
                                newFeatures[i] = { ...newFeatures[i], title: e.target.value };
                                setTempSettings({ ...tempSettings, clothingFeatures: newFeatures });
                              }}
                              placeholder={`পয়েন্ট ${i + 1} শিরোনাম`}
                              className="w-1/3 px-2 py-1 rounded border border-neutral-200 text-[10px] bg-white font-bold"
                            />
                            <input
                              type="text"
                              value={tempSettings.clothingFeatures?.[i]?.desc || ''}
                              onChange={(e) => {
                                const newFeatures = [...(tempSettings.clothingFeatures || [{title:'', desc:''}, {title:'', desc:''}, {title:'', desc:''}])];
                                newFeatures[i] = { ...newFeatures[i], desc: e.target.value };
                                setTempSettings({ ...tempSettings, clothingFeatures: newFeatures });
                              }}
                              placeholder={`পয়েন্ট ${i + 1} বর্ণনা`}
                              className="w-2/3 px-2 py-1 rounded border border-neutral-200 text-[10px] bg-white"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Section Thumbnail Uploader */}
                      <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-[11px]">
                        <span className="font-bold text-neutral-600 block">পোশাক সেকশন থাম্বনেইল ছবি (Clothing Section Thumbnail):</span>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 shadow-2xs">
                            {tempSettings.clothingImage ? (
                              <img src={tempSettings.clothingImage} alt="Clothing" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-emerald-800 font-extrabold text-[10px]">👗</span>
                            )}
                          </div>
                          <div className="flex-1 flex items-center gap-1.5">
                            <input
                              type="file"
                              id="admin-clothing-thumb-input"
                              accept="image/*"
                              onChange={handleClothingImageFileChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="admin-clothing-thumb-input"
                              className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] shadow-2xs"
                            >
                              <Upload className="w-3 h-3" />
                              <span>ছবি আপলোড</span>
                            </label>
                            {tempSettings.clothingImage && (
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setTempSettings({ ...tempSettings, clothingImage: '/src/assets/images/hero_premium_apparel_1791006163359.jpg' })}
                                  className="px-2 py-1.5 rounded-lg border border-emerald-200 text-emerald-950 bg-emerald-50 hover:bg-emerald-100 font-bold cursor-pointer"
                                  title="ডিফল্ট পোশাকের ছবিতে রিসেট করুন"
                                >
                                  ডিফল্ট ছবি দিন
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTempSettings({ ...tempSettings, clothingImage: '' })}
                                  className="px-2 py-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 font-bold cursor-pointer"
                                >
                                  ডিলিট
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* About Section Title & Description */}
                    <div className="p-3 bg-white rounded-lg border border-neutral-200 space-y-2">
                      <label className="block font-bold text-neutral-900 text-xs">
                        📖 আমাদের গল্প (About Story) সেকশন
                      </label>
                      <input
                        type="text"
                        value={tempSettings.aboutTitleBn || 'আমাদের বিশুদ্ধতা ও কোয়ালিটির নিশ্চয়তা'}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, aboutTitleBn: e.target.value })
                        }
                        placeholder="আমাদের গল্প শিরোনাম"
                        className="w-full px-3 py-1.5 rounded border border-neutral-200 text-xs bg-neutral-50 focus:bg-white font-bold"
                      />
                      <textarea
                        rows={2}
                        value={tempSettings.aboutDescBn || 'আমরা সরাসরি কৃষক ও প্রান্তিক খামারিদের কাছ থেকে সবচেয়ে সেরা মানের কঁচি হলুদ, চরের লাল মরিচ, ধনিয়া এবং বীজ সংগ্রহ করে সম্পূর্ণ স্বাস্থ্যসম্মত উপায়ে পরিচ্ছন্নভাবে গুঁড়া করি। পাশাপাশি আমাদের নিজস্ব কারিগরদের তৈরি ফ্যাব্রিক দিয়ে প্রিমিয়াম পোশাক সরবরাহ করি।'}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, aboutDescBn: e.target.value })
                        }
                        placeholder="আমাদের গল্প বর্ণনা"
                        className="w-full px-3 py-1.5 rounded border border-neutral-200 text-xs bg-neutral-50 focus:bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>
                </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>সকল পরিবর্তন সংরক্ষণ করুন</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Product Add / Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 my-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh] my-auto relative">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/90 shrink-0 sticky top-0 z-20 backdrop-blur-md">
              <h3 className="font-bold text-sm text-neutral-900">
                {editingProduct ? 'পণ্য সম্পাদনা (Edit Product)' : 'নতুন পণ্য যোগ করুন'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Product Image Upload & Selector */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <label className="block font-bold text-neutral-900">
                  পণ্যের ছবি (Product Photo) *
                </label>

                <div className="flex items-center gap-3">
                  {/* Image Preview Box */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-neutral-200 shrink-0 shadow-xs relative">
                    {productForm.image ? (
                      <img
                        src={productForm.image}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Upload button */}
                  <div className="space-y-1">
                    <input
                      type="file"
                      id="product-image-file-input"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-image-file-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>গ্যালারি / ক্যামেরা থেকে ছবি দিন</span>
                    </label>
                    <p className="text-[10px] text-neutral-500">
                      JPG, PNG বা WebP ফরম্যাট (সর্বোচ্চ 5MB)
                    </p>
                  </div>
                </div>

                {/* Direct URL input */}
                <div>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, image: e.target.value }))
                    }
                    placeholder="অথবা ছবির ওয়েব লিংক (URL) লিখুন..."
                    className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    পণ্যের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: খাঁটি হলুদের গুঁড়া"
                    value={productForm.nameBn}
                    onChange={(e) => setProductForm({ ...productForm, nameBn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    পণ্যের নাম (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Mountain Turmeric"
                    value={productForm.nameEn}
                    onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">ক্যাটাগরি *</label>
                <select
                  value={productForm.categoryBn}
                  onChange={(e) => {
                    const bn = e.target.value;
                    let en = 'Premium Nuts';
                    if (bn === 'বাদাম ও ড্রাই ফ্রুটস' || bn === 'প্রিমিয়াম বাদাম') en = 'Nuts & Dry Fruits';
                    else if (bn === 'খেজুর ও এপ্রিকট') en = 'Dates & Apricots';
                    else if (bn === 'তেল ও ঘি') en = 'Oils & Ghee';
                    else if (bn === 'মধু ও বীজ') en = 'Honey & Seeds';
                    else if (bn === 'পাঞ্জাবি কালেকশন') en = 'Panjabi Collection';
                    else if (bn === 'শাড়ি ও থ্রি-পিস') en = 'Saree & Three Piece';
                    else if (bn === 'টি-শার্ট ও মেনস ওয়্যার') en = 'T-Shirts & Menswear';
                    else if (bn === 'বোরকা ও হিজাব') en = 'Borka & Hijab';
                    else if (bn === 'পোশাক ও ফ্যাশন') en = 'Clothing & Fashion';
                    
                    setProductForm({ ...productForm, categoryBn: bn, categoryEn: en });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
                >
                  <optgroup label="🥜 ড্রাই ফ্রুটস ও খাদ্যপণ্য">
                    <option value="বাদাম ও ড্রাই ফ্রুটস">বাদাম ও ড্রাই ফ্রুটস</option>
                    <option value="খেজুর ও এপ্রিকট">খেজুর ও এপ্রিকট</option>
                    <option value="মধু ও বীজ">মধু ও বীজ</option>
                    <option value="তেল ও ঘি">তেল ও ঘি</option>
                  </optgroup>
                  <optgroup label="👗 কাপড় ও পোশাক কালেকশন">
                    <option value="পাঞ্জাবি কালেকশন">পাঞ্জাবি কালেকশন</option>
                    <option value="শাড়ি ও থ্রি-পিস">শাড়ি ও থ্রি-পিস</option>
                    <option value="টি-শার্ট ও মেনস ওয়্যার">টি-শার্ট ও মেনস ওয়্যার</option>
                    <option value="বোরকা ও হিজাব">বোরকা ও হিজাব</option>
                    <option value="পোশাক ও ফ্যাশন">পোশাক ও ফ্যাশন</option>
                  </optgroup>
                </select>
              </div>

              {/* Quantity & Unit Selection (KG / GM / Pcs / Set / Ltr) */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral-900 text-xs">
                    পণ্যের পরিমাণ ও একক (Quantity & Unit) *
                  </label>
                  <span className="text-[10.5px] text-amber-950 font-black bg-amber-200/80 px-2 py-0.5 rounded-md font-mono">
                    {productForm.quantity} {productForm.unit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  {/* Quantity Value */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      পরিমাণ (Quantity)
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.quantity}
                      onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                      placeholder="যেমন: 1, 500, 250, 2"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Unit Selection: KG, GM, Pcs, Set, Ltr */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      একক (Unit) নির্বাচন করুন
                    </label>
                    <div className="grid grid-cols-5 gap-1 p-0.5 bg-neutral-200/90 rounded-lg">
                      {(['KG', 'GM', 'Pcs', 'Set', 'Ltr'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, unit: u })}
                          className={`py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
                            productForm.unit === u
                              ? 'bg-emerald-800 text-white shadow-xs font-black'
                              : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Unit Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-neutral-500 font-medium">কুইক সিলেক্ট:</span>
                  {[
                    { q: '1', u: 'Pcs' },
                    { q: '1', u: 'Set' },
                    { q: '250', u: 'GM' },
                    { q: '500', u: 'GM' },
                    { q: '1', u: 'KG' },
                    { q: '2', u: 'KG' },
                    { q: '1', u: 'Ltr' },
                  ].map((preset) => (
                    <button
                      key={`${preset.q}-${preset.u}`}
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          quantity: preset.q,
                          unit: preset.u,
                        })
                      }
                      className={`px-2 py-0.5 rounded-md border text-[10.5px] font-bold transition-colors cursor-pointer ${
                        productForm.quantity === preset.q && productForm.unit === preset.u
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white border-amber-300 text-neutral-800 hover:bg-amber-100'
                      }`}
                    >
                      {preset.q} {preset.u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing, Offer Price & Discount */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-emerald-950 text-xs">
                    মূল্য, অফার ও ডিসকাউন্ট (Pricing & Offer) *
                  </label>
                  {productForm.originalPrice > productForm.price && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold shadow-2xs">
                      ★ {Math.round(((productForm.originalPrice - productForm.price) / productForm.originalPrice) * 100)}% ছাড় (৳{productForm.originalPrice - productForm.price} সাশ্রয়)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Regular / Original Price */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      রেগুলার আসল দাম (৳)
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.originalPrice}
                      onChange={(e) => {
                        const orig = Number(e.target.value);
                        const discount = productForm.discountPercent || 0;
                        const newPrice = discount > 0 ? Math.round(orig * (1 - discount / 100)) : orig;
                        setProductForm({
                          ...productForm,
                          originalPrice: orig,
                          price: newPrice,
                        });
                      }}
                      placeholder="যেমন: 400"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <span className="text-[9.5px] text-neutral-400 mt-0.5 block">পূর্বের বা আসল মূল্য</span>
                  </div>

                  {/* Offer / Selling Price */}
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      অফার বিক্রয় মূল্য (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => {
                        const pr = Number(e.target.value);
                        const orig = productForm.originalPrice || pr;
                        const disc = orig > pr ? Math.round(((orig - pr) / orig) * 100) : 0;
                        setProductForm({
                          ...productForm,
                          price: pr,
                          discountPercent: disc,
                        });
                      }}
                      placeholder="যেমন: 340"
                      className="w-full px-3 py-2 rounded-lg border border-emerald-500 bg-white font-mono font-black text-xs text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-xs"
                    />
                    <span className="text-[9.5px] text-emerald-700 font-semibold mt-0.5 block">কাস্টমার যে দাম দেবে</span>
                  </div>

                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      ডিসকাউন্ট (% ছাড়)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={productForm.discountPercent}
                        onChange={(e) => {
                          const disc = Number(e.target.value);
                          const orig = productForm.originalPrice || productForm.price;
                          const newPrice = disc > 0 ? Math.round(orig * (1 - disc / 100)) : orig;
                          setProductForm({
                            ...productForm,
                            discountPercent: disc,
                            price: newPrice,
                          });
                        }}
                        placeholder="যেমন: 15"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 pr-7"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold font-mono">
                        %
                      </span>
                    </div>
                    <span className="text-[9.5px] text-neutral-400 mt-0.5 block">অটো মূল্য হিসাব হবে</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  ওজন / প্যাক অপশন (লেবেল:দাম কমা দিয়ে লিখুন)
                </label>
                <input
                  type="text"
                  value={productForm.weightOptionsStr}
                  onChange={(e) =>
                    setProductForm({ ...productForm, weightOptionsStr: e.target.value })
                  }
                  placeholder="২৫০ গ্রাম:180, ৫০০ গ্রাম:340, ১ কেজি:650"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  যেমন: ২৫০ গ্রাম:180, ৫০০ গ্রাম:340, ১ কেজি:650
                </span>
              </div>

              {/* Stock Inventory Quantity & Low Stock Threshold */}
              <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-700" />
                    <span>মজুদ সংখ্যা ও ইনভেন্টরি নিয়ন্ত্রণ (Inventory Stock Units) *</span>
                  </label>
                  <span className="text-[10px] text-neutral-500 font-semibold">
                    অটোমেটেড লো-স্টক অ্যালার্ট
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-800 mb-1 flex items-center justify-between">
                      <span>বর্তমান মজুদ সংখ্যা (Units) *</span>
                      <span className="text-[10px] text-neutral-500">যেমন: ১৫, ৫, ২, ০</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stockQuantity}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setProductForm({
                          ...productForm,
                          stockQuantity: val,
                          inStock: val > 0,
                          stockStatusText: val === 0 ? (productForm.stockStatusText || 'স্টক আউট') : '',
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">
                      অর্ডার হলে এই সংখ্যা থেকে স্বয়ংক্রিয়ভাবে বাদ যাবে
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-800 mb-1 flex items-center justify-between">
                      <span>কাস্টম অ্যালার্ট সীমা (ঐচ্ছিক)</span>
                      <span className="text-[10px] text-amber-800 font-bold">ডিফল্ট: {settings.lowStockThreshold || 5} ইউনিট</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder={`ডিফল্ট (${settings.lowStockThreshold || 5} ইউনিট)`}
                      value={productForm.lowStockThreshold}
                      onChange={(e) =>
                        setProductForm({ ...productForm, lowStockThreshold: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                    />
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">
                      ফাঁকা রাখলে স্টোরের ডিফল্ট লিমিট কার্যকর হবে
                    </span>
                  </div>
                </div>

                {/* Immediate Alert Feedback in Form */}
                {Number(productForm.stockQuantity) <= (Number(productForm.lowStockThreshold) || settings.lowStockThreshold || 5) && (
                  <div className="p-2 rounded-lg bg-amber-100/80 border border-amber-300 flex items-center gap-2 text-[11px] text-amber-950 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>
                      {Number(productForm.stockQuantity) === 0
                        ? '✕ স্টক শূন্য (০ ইউনিট) - পণ্যটি স্টক আউট হিসেবে চিহ্নিত হবে।'
                        : `⚠️ লো-স্টক সতর্কতা: মজুদ সংখ্যা (${productForm.stockQuantity} ইউনিট) অ্যালার্ট লিমিটের নিচে!`}
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Status & Stock Out Control */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                productForm.inStock 
                  ? 'bg-emerald-50/70 border-emerald-300/80' 
                  : 'bg-rose-50/80 border-rose-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <span>স্টক প্রাপ্যতা ও স্টক আউট নিয়ন্ত্রণ (Stock Availability) *</span>
                  </label>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    productForm.inStock 
                      ? 'bg-emerald-200 text-emerald-950' 
                      : 'bg-rose-200 text-rose-950 font-mono'
                  }`}>
                    {productForm.inStock ? 'ইন স্টক (In Stock)' : 'স্টক আউট (Stock Out)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, inStock: true })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      productForm.inStock
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-white border-neutral-300 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>✓ ইন স্টক (স্টকে পণ্য আছে)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, inStock: false })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      !productForm.inStock
                        ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                        : 'bg-white border-neutral-300 text-neutral-700 hover:bg-rose-50 hover:text-rose-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-300" />
                    <span>✕ স্টক আউট (স্টক শেষ)</span>
                  </button>
                </div>

                {!productForm.inStock && (
                  <div className="mt-2.5 pt-2.5 border-t border-rose-200/80 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-rose-950">
                      কাস্টমারদের জন্য স্টক আউট নোটিশ (ঐচ্ছিক বার্তা):
                    </label>
                    <input
                      type="text"
                      value={productForm.stockStatusText}
                      onChange={(e) => setProductForm({ ...productForm, stockStatusText: e.target.value })}
                      placeholder="যেমন: স্টক আউট, শীঘ্রই স্টক আসবে, স্টক শেষ..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-rose-600 placeholder:text-neutral-400"
                    />
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-rose-800 font-medium">কুইক সিলেক্ট:</span>
                      {['স্টক আউট', 'স্টক শেষ', 'শীঘ্রই স্টক আসবে', 'Stock Out'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, stockStatusText: tag })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            productForm.stockStatusText === tag
                              ? 'bg-rose-800 text-white border border-rose-800'
                              : 'bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  সংক্ষিপ্ত বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  value={productForm.descBn}
                  onChange={(e) => setProductForm({ ...productForm, descBn: e.target.value })}
                  placeholder="পণ্যের গুণাগুণ ও বিশেষত্ব..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
                />
              </div>

              </div>

              <div className="p-4 px-6 border-t border-neutral-200 bg-neutral-50/90 shrink-0 flex items-center justify-between gap-2 sticky bottom-0 z-20 backdrop-blur-md">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation({
                        type: 'product',
                        id: editingProduct.id,
                        title: editingProduct.nameBn,
                        subtitle: `ক্যাটাগরি: ${editingProduct.categoryBn} | মূল্য: ৳${editingProduct.price}`
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
                    title="এই পণ্য ও বিবরণ ডিলিট করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>পণ্য ডিলিট</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer text-xs font-bold transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold shadow-md hover:shadow-lg cursor-pointer text-xs transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingProduct ? 'আপডেট করুন' : 'পণ্য যোগ করুন'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal (Edit Customer Phone, Address, Payment Info & Charges) */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">
                    অর্ডারের তথ্য ও ফোন নম্বর পরিবর্তন
                  </h3>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    #{editingOrder.invoiceNumber || editingOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="text-neutral-400 hover:text-neutral-700 text-lg font-bold p-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const deliveryFee = Number(editingOrder.deliveryFee) || 0;
                const total = editingOrder.subtotal + deliveryFee;
                const defaultAdv = editingOrder.paymentMethod !== 'cod' ? total : 0;
                const advancePaid = Math.min(
                  total,
                  Math.max(
                    0,
                    Number(editingOrder.advancePaid !== undefined ? editingOrder.advancePaid : defaultAdv)
                  )
                );
                const dueAmount = Math.max(0, total - advancePaid);
                const updated: AdminOrder = {
                  ...editingOrder,
                  deliveryFee,
                  total,
                  advancePaid,
                  dueAmount,
                };
                onUpdateOrder?.(updated);
                if (invoiceOrder && invoiceOrder.id === updated.id) {
                  setInvoiceOrder(updated);
                }
                setEditingOrder(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    গ্রাহকের পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOrder.customerName}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-900 mb-1">
                    গ্রাহকের মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOrder.customerPhone}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerPhone: e.target.value })
                    }
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-emerald-500 bg-white font-mono font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  ডেলিভারি ঠিকানা *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingOrder.customerAddress}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, customerAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 resize-none"
                />
              </div>

              {/* Order Notes / Customer Instructions */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                  <span>অর্ডার নোট / গ্রাহকের নির্দেশাবলী</span>
                </label>
                <textarea
                  rows={2}
                  value={editingOrder.orderNotes || ''}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, orderNotes: e.target.value })
                  }
                  placeholder="গ্রাহকের বিশেষ নির্দেশাবলী বা বিশেষ নোট..."
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-amber-50/50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    ডেলিভারি এলাকা
                  </label>
                  <select
                    value={editingOrder.deliveryArea}
                    onChange={(e) => {
                      const area = e.target.value as 'dhaka' | 'outside';
                      const defaultFee =
                        area === 'dhaka'
                          ? settings.deliveryFeeDhaka || 60
                          : settings.deliveryFeeOutside || 120;
                      setEditingOrder({
                        ...editingOrder,
                        deliveryArea: area,
                        deliveryFee: defaultFee,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                  >
                    <option value="dhaka">ঢাকার ভেতরে (Dhaka)</option>
                    <option value="outside">ঢাকার বাইরে (Outside Dhaka)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    ডেলিভারি চার্জ (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingOrder.deliveryFee}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        deliveryFee: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Payment Channel and TrxID */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral-800">
                    পেমেন্ট মাধ্যম নির্বাচন
                  </label>
                  <div className="flex gap-1">
                    {(['cod', 'bkash', 'nagad'] as const).map((pm) => (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => {
                          const fee = Number(editingOrder.deliveryFee) || 0;
                          const currentTotal = editingOrder.subtotal + fee;
                          const defaultAdv = pm !== 'cod' ? currentTotal : 0;
                          setEditingOrder({
                            ...editingOrder,
                            paymentMethod: pm,
                            advancePaid: defaultAdv,
                            dueAmount: currentTotal - defaultAdv,
                          });
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                          editingOrder.paymentMethod === pm
                            ? pm === 'bkash'
                              ? 'bg-pink-600 text-white'
                              : pm === 'nagad'
                              ? 'bg-orange-600 text-white'
                              : 'bg-emerald-800 text-white'
                            : 'bg-white border border-neutral-200 text-neutral-700'
                        }`}
                      >
                        {pm === 'cod' ? 'ক্যাশ অন ডেলিভারি' : pm === 'bkash' ? 'বিকাশ' : 'নগদ'}
                      </button>
                    ))}
                  </div>
                </div>

                {editingOrder.paymentMethod !== 'cod' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-200">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                        প্রেরকের বিকাশ/নগদ নম্বর
                      </label>
                      <input
                        type="text"
                        value={editingOrder.senderNumber || ''}
                        onChange={(e) =>
                          setEditingOrder({
                            ...editingOrder,
                            senderNumber: e.target.value,
                          })
                        }
                        placeholder="017XXXXXXXX"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                        Transaction ID (TrxID)
                      </label>
                      <input
                        type="text"
                        value={editingOrder.trxId || ''}
                        onChange={(e) =>
                          setEditingOrder({
                            ...editingOrder,
                            trxId: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="9L87X2K4Q"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white font-mono uppercase font-bold text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                )}

                {/* Advance Paid Amount Input & Quick Buttons */}
                <div className="pt-2 border-t border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-emerald-950">
                      অগ্রিম পরিশোধ / জমা টাকা (Advance Paid ৳)
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      মোট বিল: ৳{(editingOrder.subtotal + Number(editingOrder.deliveryFee || 0)).toLocaleString()}
                    </span>
                  </div>

                  {(() => {
                    const fee = Number(editingOrder.deliveryFee) || 0;
                    const orderTot = editingOrder.subtotal + fee;
                    const adv = editingOrder.advancePaid ?? (editingOrder.paymentMethod !== 'cod' ? orderTot : 0);

                    return (
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-neutral-400 font-bold">৳</span>
                          <input
                            type="number"
                            min="0"
                            max={orderTot}
                            value={adv}
                            onChange={(e) => {
                              const val = Math.min(orderTot, Math.max(0, Number(e.target.value) || 0));
                              setEditingOrder({
                                ...editingOrder,
                                advancePaid: val,
                                dueAmount: orderTot - val,
                              });
                            }}
                            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-emerald-400 bg-white font-mono font-bold text-sm text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingOrder({
                                ...editingOrder,
                                advancePaid: orderTot,
                                dueAmount: 0,
                              })
                            }
                            className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                              adv === orderTot
                                ? 'bg-emerald-700 text-white'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            ফুল পেইড (৳{orderTot.toLocaleString()})
                          </button>

                          {fee > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingOrder({
                                  ...editingOrder,
                                  advancePaid: fee,
                                  dueAmount: orderTot - fee,
                                })
                              }
                              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                                adv === fee
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                              }`}
                            >
                              ডেলিভারি ফি (৳{fee})
                            </button>
                          )}

                          {[100, 200, 500].filter((amt) => amt < orderTot).map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() =>
                                setEditingOrder({
                                  ...editingOrder,
                                  advancePaid: amt,
                                  dueAmount: orderTot - amt,
                                })
                              }
                              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                                adv === amt
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                              }`}
                            >
                              ৳{amt}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setEditingOrder({
                                ...editingOrder,
                                advancePaid: 0,
                                dueAmount: orderTot,
                              })
                            }
                            className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                              adv === 0
                                ? 'bg-neutral-800 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            ০ (বকেয়া)
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Amount & Due Calculation Summary Box */}
              {(() => {
                const fee = Number(editingOrder.deliveryFee) || 0;
                const orderTot = editingOrder.subtotal + fee;
                const adv = editingOrder.advancePaid ?? (editingOrder.paymentMethod !== 'cod' ? orderTot : 0);
                const due = Math.max(0, orderTot - adv);

                return (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-700">
                      <span>পণ্য সাবটোটাল:</span>
                      <span className="font-mono font-bold">৳{editingOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-mono font-bold">৳{fee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-emerald-200/70">
                      <span>সর্বমোট অর্ডার বিল:</span>
                      <span className="font-mono font-black text-sm">৳{orderTot.toLocaleString()}</span>
                    </div>

                    {adv > 0 && (
                      <div className="flex justify-between text-emerald-800 font-bold bg-white px-2 py-1 rounded border border-emerald-300">
                        <span>অগ্রিম পরিশোধ (Advance Paid):</span>
                        <span className="font-mono font-black">-৳{adv.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-emerald-200/80">
                      <span className="font-black text-neutral-900 text-xs">
                        কাস্টমার থেকে প্রদেয় (বকেয়া / Due):
                      </span>
                      {due === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase">
                          ✓ সম্পূর্ণ পেইড (Fully Paid)
                        </span>
                      ) : (
                        <span className="font-mono font-black text-base text-red-600 tabular-nums bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          ৳{due.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
                {onDeleteOrder ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation({
                        type: 'order',
                        id: editingOrder.id,
                        title: `অর্ডার #${editingOrder.invoiceNumber || editingOrder.orderNumber} (${editingOrder.customerName})`,
                        subtitle: `মোট বিল: ৳${(editingOrder.subtotal + Number(editingOrder.deliveryFee || 0)).toLocaleString()} | মোবাইল: ${editingOrder.customerPhone}`
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
                    title="এই অর্ডার মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>অর্ডার মুছুন</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer text-xs"
                  >
                    পরিবর্তন সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Ultra-Premium Invoice Receipt Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
          <style>{`
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-invoice-modal, #printable-invoice-modal * {
                visibility: visible !important;
              }
              #printable-invoice-modal {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 10px !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print-btn {
                display: none !important;
              }
              .print-only {
                display: inline-block !important;
              }
            }
          `}</style>
          <div
            id="printable-invoice-modal"
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900 transition-all my-auto"
          >
            {/* Modal Top Action Bar (Hidden during print) */}
            <div className="no-print-btn px-4 sm:px-6 py-3 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white tracking-wide">
                    অর্ডার ইনভয়েস ও ক্যাশ মেমো
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    {invoiceCopies === 2 ? 'এক পাতায় ২টি কপি (A4 ডাবল মেমো)' : 'হাফ পেজ মেমো (A5 সাইজ)'}
                  </p>
                </div>
              </div>

              {/* 1 Copy vs 2 Copies Selector */}
              <div className="flex items-center bg-neutral-800/90 p-1 rounded-xl border border-neutral-700/80 text-xs">
                <button
                  type="button"
                  onClick={() => setInvoiceCopies(1)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    invoiceCopies === 1
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                  title="১ পৃষ্ঠায় ১টি কপি"
                >
                  ১ কপি
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceCopies(2)}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    invoiceCopies === 2
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                  title="একই A4 পৃষ্ঠায় ২টি কপি (অফিস কপি ও কাস্টমার কপি)"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>২ কপি (১ পেজে)</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-neutral-950 font-black">
                    A4
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {invoiceOrder && invoiceOrder.status === 'delivered' && (
                  <button
                    type="button"
                    onClick={() => handleCopyTrackingLink(invoiceOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="কাস্টমারের জন্য প্যাকেজ ট্র্যাকিং লিংক কপি করুন"
                  >
                    {copiedTrackOrderId === invoiceOrder.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>লিংক কপিড!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Tracking Link</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
                  title="ইনভয়েসটি সরাসরি PDF আকারে ডাউনলোড করুন"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>PDF তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF ডাউনলোড</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold transition-colors border border-neutral-700 active:scale-95 cursor-pointer"
                  title="সরাসরি প্রিন্টার দিয়ে প্রিন্ট করুন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors ml-1 cursor-pointer"
                  title="বন্ধ করুন"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Invoice Paper Content */}
            <div id="printable-invoice-paper" className="p-3 sm:p-5 relative bg-white text-neutral-900">
              {(() => {
                const renderSinglePaper = (order: AdminOrder, isDouble = false) => (
                  <div className={`space-y-${isDouble ? '2' : '2.5'} relative bg-white text-neutral-900`}>
                    {/* Luxury Accent Bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 rounded-full mb-0.5" />

                    {/* Logo Watermark in Center (জলছাপ) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                      <div className="flex flex-col items-center justify-center opacity-[0.06] transform scale-100">
                        {settings.logoImage ? (
                          <img
                            src={settings.logoImage}
                            alt=""
                            className="w-52 h-52 sm:w-64 sm:h-64 object-contain rounded-full"
                          />
                        ) : (
                          <div className="w-48 h-48 rounded-full border-8 border-emerald-950 flex flex-col items-center justify-center text-center p-4">
                            <span className="text-6xl font-black text-emerald-950 uppercase tracking-wider">
                              {settings.logoLetter || settings.storeName.charAt(0)}
                            </span>
                            <span className="text-xs font-black text-emerald-950 tracking-widest mt-2 uppercase">
                              {settings.storeName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Header: Brand & Invoice Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 pb-1 border-b border-neutral-200">
                      {/* Left: Brand Logo */}
                      <div className="sm:col-span-2 flex items-center justify-center sm:justify-start">
                        <div className={`${isDouble ? 'w-9 h-9 text-lg' : 'w-11 h-11 text-xl'} rounded-xl bg-gradient-to-br from-emerald-800 to-teal-950 text-amber-300 font-extrabold flex items-center justify-center shadow-sm border border-amber-400/40 shrink-0`}>
                          {settings.logoImage ? (
                            <img src={settings.logoImage} alt={settings.storeName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span>{settings.logoLetter || settings.storeName.charAt(0)}</span>
                          )}
                        </div>
                      </div>

                      {/* Center: Brand Title, Tagline, Address & Contact */}
                      <div className="sm:col-span-7 flex flex-col items-center justify-center text-center space-y-0 px-2">
                        <h2 className={`font-black ${isDouble ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-neutral-900 tracking-tight leading-tight`}>
                          {settings.storeName}
                        </h2>
                        <p className="text-[9px] text-neutral-600 font-medium text-center max-w-sm line-clamp-1 leading-tight">
                          {settings.storeTagline}
                        </p>

                        <div className="text-[8.5px] text-neutral-600 pt-0.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0 border-t border-neutral-100 w-full max-w-md mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                            <span>{settings.address || 'রোড ৪, মিরপুর ডিওএইচএস, ঢাকা'}</span>
                          </span>
                          <span className="flex items-center gap-1 font-mono font-medium text-neutral-800">
                            <Phone className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                            <span>{settings.phone}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right: Barcode / QR Code (Moved here as requested) */}
                      <div className="sm:col-span-3 flex flex-col items-center sm:items-end justify-center">
                        <div className="flex flex-col items-center">
                          <div className="flex gap-[1.2px] h-3 items-center px-1 py-0.5 bg-white rounded border border-neutral-200">
                            {[2, 1, 2, 3, 1, 2, 2, 1, 3, 2, 2, 1, 2].map((w, idx) => (
                              <div
                                key={idx}
                                className="bg-neutral-900 h-full"
                                style={{ width: `${w}px` }}
                              />
                            ))}
                          </div>
                          <span className="text-[7px] font-mono text-neutral-400 tracking-wider">
                            TRK-{order.invoiceNumber || order.orderNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details, Invoice Number & Date in clean compact serial */}
                    <div className="py-1 px-0.5 border-b border-neutral-200 text-[10.5px] text-neutral-800">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 items-start">
                        {/* Row 1: Invoice Number & Date */}
                        <div className="flex items-start">
                          <span className="font-bold text-neutral-900 w-24 shrink-0">Invoice Number:</span>
                          <span className="font-mono font-bold text-neutral-950">
                            #{order.invoiceNumber || order.orderNumber}
                          </span>
                        </div>

                        <div className="flex items-start">
                          <span className="font-bold text-neutral-900 w-16 shrink-0">Date:</span>
                          <span className="font-mono font-semibold text-neutral-900">{formatOrderDateTime(order.createdAt)}</span>
                        </div>

                        {/* Row 2: Customer Name & Phone */}
                        <div className="flex items-start">
                          <span className="font-bold text-neutral-900 w-24 shrink-0">Customer Name:</span>
                          <span className="font-bold text-neutral-950">{order.customerName}</span>
                        </div>

                        <div className="flex items-start">
                          <span className="font-bold text-neutral-900 w-16 shrink-0">Phone:</span>
                          <span className="font-mono font-bold text-emerald-800">{order.customerPhone}</span>
                        </div>

                        {/* Row 3: Address (Full Width) */}
                        <div className="flex items-start col-span-2">
                          <span className="font-bold text-neutral-900 w-24 shrink-0">Address:</span>
                          <span className="text-neutral-800 font-medium leading-tight">
                            {order.customerAddress}{' '}
                            <span className="text-neutral-500 font-normal">
                              ({order.deliveryArea === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})
                            </span>
                          </span>
                        </div>

                        {order.orderNotes && (
                          <div className="flex items-start col-span-2 pt-0.5 border-t border-dashed border-amber-200 mt-0.5">
                            <span className="font-bold text-amber-900 w-24 shrink-0">Order Notes:</span>
                            <span className="text-amber-900 font-medium italic bg-amber-50 px-1.5 py-0.2 rounded leading-tight">
                              {order.orderNotes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items Table: Compact & Half-Page Proportionate */}
                    <div className="rounded-xl border border-neutral-200 overflow-hidden">
                      {(() => {
                        const itemUnitsList = order.items.map((item) => {
                          if (item.unit) return item.unit;
                          const name = (item.productName || '').toLowerCase();
                          const matchingProduct = products.find(
                            (p) =>
                              p.nameBn.toLowerCase() === name ||
                              p.nameEn.toLowerCase() === name ||
                              name.includes(p.nameBn.toLowerCase()) ||
                              name.includes(p.nameEn.toLowerCase())
                          );
                          if (matchingProduct?.unit) return matchingProduct.unit;
                          if (name.includes('গ্রাম') || name.includes('gm')) return 'GM';
                          if (name.includes('কেজি') || name.includes('kg')) return 'KG';
                          if (name.includes('লিটার') || name.includes('ltr') || name.includes('liter')) return 'LTR';
                          return 'Pcs';
                        });

                        const isAllSameUnit =
                          itemUnitsList.length > 0 &&
                          itemUnitsList.every((u) => u.toUpperCase() === itemUnitsList[0].toUpperCase());
                        const dominantUnit = (itemUnitsList[0] || 'Pcs').toUpperCase();

                        let quantityHeaderLabel = 'QUANTITY';
                        if (isAllSameUnit) {
                          if (dominantUnit === 'KG') quantityHeaderLabel = 'KG';
                          else if (dominantUnit === 'GM') quantityHeaderLabel = 'GM';
                          else if (dominantUnit === 'LTR') quantityHeaderLabel = 'LTR';
                          else quantityHeaderLabel = 'QUANTITY';
                        } else {
                          const uniqueUnits = Array.from(
                            new Set(itemUnitsList.map((u) => (u === 'Pcs' ? 'QTY' : u.toUpperCase())))
                          );
                          quantityHeaderLabel = uniqueUnits.join(' / ');
                        }

                        return (
                          <table className="w-full text-left text-[11px]">
                            <thead>
                              <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-700 text-[10px] font-bold uppercase tracking-wider">
                                <th className="py-1 px-2.5 w-10 text-center">SL</th>
                                <th className="py-1 px-2.5">Name of the product</th>
                                <th className="py-1 px-2 text-center w-28 font-black text-neutral-900 tracking-wider">
                                  {quantityHeaderLabel}
                                </th>
                                <th className="py-1 px-2.5 text-right w-28">Amount (BDT)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 bg-white">
                              {order.items.map((item, idx) => {
                                const cleanName = item.productName;
                                const qtyToDisplay = item.quantity;

                                return (
                                  <tr key={idx} className="hover:bg-neutral-50/50">
                                    <td className="py-1.5 px-2.5 text-center font-mono text-neutral-400 font-semibold text-[10px]">
                                      {String(idx + 1).padStart(2, '0')}
                                    </td>
                                    <td className="py-1.5 px-2.5">
                                      <span className="font-bold text-neutral-900 text-xs">
                                        {cleanName}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-2 text-center font-mono font-bold text-neutral-900 text-xs">
                                      {qtyToDisplay}
                                    </td>
                                    <td className="py-1.5 px-2.5 text-right font-mono tabular-nums font-bold text-neutral-900 text-xs">
                                      ৳{(item.price * item.quantity).toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        );
                      })()}
                    </div>

                    {/* Bottom Section: Compact Stamp & Calculation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                      {/* Official Stamp & Return Policy */}
                      <div className="flex items-center gap-3">
                        <div className={`relative border-2 border-dashed border-emerald-600 rounded-full ${isDouble ? 'w-12 h-12' : 'w-14 h-14'} p-0.5 flex items-center justify-center rotate-[-6deg] shadow-2xs select-none shrink-0 bg-emerald-50/40`}>
                          <div className="border border-emerald-500 rounded-full w-full h-full flex flex-col items-center justify-center text-center p-0.5">
                            <span className="text-[5.5px] font-black text-emerald-800 tracking-tighter uppercase leading-none truncate max-w-[46px]">
                              {settings.storeName}
                            </span>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 text-white flex items-center justify-center my-0.5">
                              <Check className="w-1.5 h-1.5 stroke-[3]" />
                            </div>
                            <span className="text-[5px] font-black text-emerald-700 tracking-tight uppercase leading-none">
                              ★ VERIFIED ★
                            </span>
                          </div>
                        </div>

                        <div className="text-[9.5px] text-neutral-600 space-y-0.5">
                          <div className="font-bold text-neutral-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            ডেলিভারি ও রিটার্ন পলিসি:
                          </div>
                          <p className="text-[8.5px] text-neutral-500 leading-tight">
                            ডেলিভারি ম্যানের সামনে প্যাকেট চেক করুন। প্রয়োজনে কল দিন: <strong>{settings.phone}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Calculation Summary Card formatted strictly: Total -> delivery charge -> Discount -> Grand Total -> Paid -> Due */}
                      {(() => {
                        let calculatedDiscount = order.discountAmount || 0;
                        if (!calculatedDiscount && order.originalSubtotal && order.originalSubtotal > order.subtotal) {
                          calculatedDiscount = order.originalSubtotal - order.subtotal;
                        }
                        const subtotal = order.subtotal;
                        const deliveryFee = order.deliveryFee || 0;
                        const grandTotal = order.total;
                        const adv = order.advancePaid !== undefined ? order.advancePaid : (order.paymentMethod !== 'cod' ? grandTotal : 0);
                        const due = order.dueAmount !== undefined ? order.dueAmount : Math.max(0, grandTotal - adv);

                        return (
                          <div className="rounded-xl bg-neutral-50/90 border border-neutral-200 p-2.5 space-y-1.5 font-sans">
                            {/* 1. Total */}
                            <div className="flex justify-between text-[11px] text-neutral-700 font-semibold">
                              <span>Total:</span>
                              <span className="font-mono tabular-nums text-neutral-900 font-bold">
                                ৳{subtotal.toLocaleString()}
                              </span>
                            </div>

                            {/* 2. delivery charge */}
                            <div className="flex justify-between text-[11px] text-neutral-700 font-semibold">
                              <span>delivery charge:</span>
                              <span className="font-mono tabular-nums text-neutral-900 font-bold">
                                ৳{deliveryFee.toLocaleString()}
                              </span>
                            </div>

                            {/* 3. Discount */}
                            <div className="flex justify-between text-[11px] text-neutral-700 font-semibold">
                              <span>Discount :</span>
                              <span className="font-mono tabular-nums text-emerald-700 font-bold">
                                {calculatedDiscount > 0 ? `-৳${calculatedDiscount.toLocaleString()}` : '৳0'}
                              </span>
                            </div>

                            {/* 4. Grand Total */}
                            <div className="pt-1 border-t border-neutral-200 flex justify-between items-center text-[12px] font-black text-neutral-900 bg-neutral-100 px-2 py-1 rounded">
                              <span className="uppercase tracking-wide">Grand Total:</span>
                              <span className="font-mono text-sm font-black text-emerald-950 tabular-nums">
                                ৳{grandTotal.toLocaleString()}
                              </span>
                            </div>

                            {/* 5. Paid */}
                            <div className="flex justify-between text-[11px] text-neutral-700 font-bold px-0.5">
                              <span>Paid:</span>
                              <span className="font-mono tabular-nums text-emerald-800 font-black">
                                ৳{adv.toLocaleString()}
                              </span>
                            </div>

                            {/* 6. Due */}
                            <div className="flex justify-between items-center text-[11.5px] font-black px-0.5 pt-0.5 border-t border-neutral-200">
                              <span className="text-neutral-900">Due:</span>
                              {due === 0 ? (
                                <span className="text-[9.5px] bg-emerald-100 text-emerald-900 font-black px-1.5 py-0.2 rounded border border-emerald-300">
                                  0 (PAID)
                                </span>
                              ) : (
                                <span className="font-mono font-black text-xs text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 tabular-nums">
                                  ৳{due.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Signatures */}
                    <div className="pt-1.5 border-t border-dashed border-neutral-200 flex justify-between items-end text-[10px]">
                      <div className="text-center w-36">
                        <div className="border-b border-neutral-300 pb-0.5 mb-0.5 font-mono text-[9px] text-neutral-400">
                          ....................................
                        </div>
                        <span className="text-[9px] font-bold text-neutral-700">
                          Customer Signature
                        </span>
                      </div>

                      <div className="text-center w-36">
                        <div className="pb-0.5 mb-0.5 font-serif italic text-[9.5px] text-emerald-800 font-bold tracking-wider">
                          {settings.storeName}
                        </div>
                        <div className="border-t border-neutral-300 pt-0.5">
                          <span className="text-[9px] font-bold text-neutral-700">
                            Authorized Signature
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Footer Note */}
                    <div className="py-1 px-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
                      <p className="text-[9.5px] font-bold text-emerald-900">
                        {settings.storeName} থেকে কেনাকাটা করার জন্য ধন্যবাদ! সুস্থ থাকুন, খাঁটি খাবার গ্রহণ করুন।
                      </p>
                    </div>
                  </div>
                );

                if (invoiceCopies === 1) {
                  return renderSinglePaper(invoiceOrder, false);
                }

                return (
                  <div className="space-y-3">
                    {/* First Copy */}
                    {renderSinglePaper(invoiceOrder, true)}

                    {/* Subtle Dashed Separator Line */}
                    <div className="py-1">
                      <div className="border-t border-dashed border-neutral-300 w-full" />
                    </div>

                    {/* Second Copy */}
                    {renderSinglePaper(invoiceOrder, true)}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Wholesale Detail & Action Modal */}
      {selectedWholesaleItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900 my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-800">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900">
                    পাইকারি অনুসন্ধান ও বাল্ক অর্ডার বিবরণ
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    প্রাপ্তি: {selectedWholesaleItem.timestamp}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onDeleteMessage && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation({
                        type: 'wholesale',
                        id: selectedWholesaleItem.id,
                        title: selectedWholesaleItem.wholesaleDetails?.businessName || selectedWholesaleItem.name,
                        subtitle: `আগ্রহী পণ্য: ${selectedWholesaleItem.wholesaleDetails?.productInterest || 'খাঁটি পণ্য'} (${selectedWholesaleItem.wholesaleDetails?.estimatedQuantity || 'চাহিদা'})`
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    title="এই অনুসন্ধান মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>মুছে ফেলুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedWholesaleItem(null)}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 text-sm font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Business Identification Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-amber-50/30 border border-neutral-200/90 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      প্রতিষ্ঠানের নাম
                    </span>
                    <h4 className="text-base font-bold text-neutral-950 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-4 h-4 text-amber-700" />
                      <span>{selectedWholesaleItem.wholesaleDetails?.businessName || 'ব্যক্তিগত ব্যবসা / ডিলার'}</span>
                    </h4>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold border border-amber-200">
                    {selectedWholesaleItem.wholesaleDetails?.businessType || 'দোকানদার / পাইকারি ক্রেতা'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200/70 text-neutral-700">
                  <div>
                    <span className="text-neutral-400 block text-[10.5px]">যোগাযোগকারী প্রতিনিধি</span>
                    <span className="font-bold text-neutral-900 text-sm mt-0.5 block">
                      {selectedWholesaleItem.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10.5px]">জেলা / ডেলিভারি এলাকা</span>
                    <span className="font-semibold text-neutral-800 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{selectedWholesaleItem.wholesaleDetails?.district || 'বাংলাদেশ'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirements & Bulk Quantity */}
              <div className="p-4 rounded-xl bg-white border border-neutral-200 space-y-3 shadow-2xs">
                <h5 className="font-bold text-neutral-900 border-b border-neutral-100 pb-2 flex items-center justify-between">
                  <span>পণ্যের চাহিদা ও বিবরণ</span>
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                    চাহিদা: {selectedWholesaleItem.wholesaleDetails?.estimatedQuantity || 'আলোচনা সাপেক্ষে'}
                  </span>
                </h5>

                <div>
                  <span className="text-neutral-400 text-[10.5px] block">আগ্রহী পণ্য বা ক্যাটাগরি:</span>
                  <span className="font-bold text-neutral-900 text-xs mt-0.5 block">
                    {selectedWholesaleItem.wholesaleDetails?.productInterest || 'প্রিমিয়াম ড্রাই ফ্রুটস / ফ্যাশন পোশাক'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-800 leading-relaxed text-xs">
                  <span className="text-neutral-400 text-[10px] block mb-1 font-semibold uppercase">
                    ক্রেতার বিস্তারিত বার্তা:
                  </span>
                  <p className="whitespace-pre-wrap">{selectedWholesaleItem.message}</p>
                </div>
              </div>

              {/* Status Update Row */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="block font-bold text-neutral-900 text-xs">বর্তমান স্ট্যাটাস পরিবর্তন</span>
                  <span className="text-[11px] text-neutral-500">ফলো-আপের অগ্রগতি আপডেট রাখুন</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['new', 'contacted', 'quoted', 'deal_closed'] as const).map((st) => {
                    const isCur = (selectedWholesaleItem.wholesaleDetails?.status || 'new') === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateWholesaleStatus(selectedWholesaleItem, st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCur
                            ? 'bg-neutral-950 text-white shadow-xs'
                            : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {st === 'new' && 'নতুন'}
                        {st === 'contacted' && 'যোগাযোগ হয়েছে'}
                        {st === 'quoted' && 'কোটেশন প্রেরিত'}
                        {st === 'deal_closed' && 'ডিল সম্পন্ন'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Contact & Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  {selectedWholesaleItem.phone && (
                    <a
                      href={`tel:${selectedWholesaleItem.phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{selectedWholesaleItem.phone} নম্বরে কল দিন</span>
                    </a>
                  )}

                  {selectedWholesaleItem.phone && (() => {
                    const raw = selectedWholesaleItem.phone || '';
                    const cl = raw.replace(/[^0-9]/g, '');
                    const wa = cl.startsWith('880') ? cl : cl.startsWith('0') ? `880${cl.slice(1)}` : `880${cl}`;
                    const text = encodeURIComponent(`আসসালামু আলাইকুম ${selectedWholesaleItem.name} সাহেব, আপনার পাইকারি অনুসন্ধানের বিষয়ে ${settings.storeName} থেকে যোগাযোগ করছি।`);
                    return (
                      <a
                        href={`https://wa.me/${wa}?text=${text}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>হোয়াটসঅ্যাপ চ্যাট</span>
                      </a>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-2">
                  {onDeleteMessage && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmation({
                          type: 'wholesale',
                          id: selectedWholesaleItem.id,
                          title: selectedWholesaleItem.wholesaleDetails?.businessName || selectedWholesaleItem.name,
                          subtitle: `আগ্রহী পণ্য: ${selectedWholesaleItem.wholesaleDetails?.productInterest || 'খাঁটি পণ্য'} (${selectedWholesaleItem.wholesaleDetails?.estimatedQuantity || 'চাহিদা'})`
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                      title="এই পাইকারি অনুসন্ধানের সকল বিবরণ মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>বিবরণ মুছে ফেলুন</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedWholesaleItem(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Elegant Confirmation Modal for Deleting Details (Safe for Iframes) */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-900 leading-tight">
                  বিবরণ মুছে ফেলতে চান?
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  আপনি কি নিশ্চিত যে <span className="font-bold text-neutral-900">"{deleteConfirmation.title}"</span>-এর সম্পূর্ণ বিবরণ মুছে ফেলতে চান?
                </p>
                {deleteConfirmation.subtitle && (
                  <p className="text-[11px] text-neutral-400 font-mono mt-1">
                    {deleteConfirmation.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Automated Low Stock Inventory Alert & Re-stock Modal */}
      <LowStockAlertModal
        isOpen={lowStockModalOpen}
        onClose={() => setLowStockModalOpen(false)}
        products={products}
        settings={settings}
        onUpdateProducts={onUpdateProducts}
        onUpdateSettings={onUpdateSettings}
        onOpenEditProduct={(prod) => {
          setLowStockModalOpen(false);
          handleOpenEditProduct(prod);
        }}
      />
    </div>
  );
};
