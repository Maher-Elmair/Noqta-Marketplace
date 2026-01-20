/**
 * Buyer Orders Page - Enhanced Version
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { useTranslation } from "@/hooks/use-translation";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { ROUTES } from "@/lib/constants";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Trash2,
  Store,
  Tag,
  Filter,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { useAuthStore } from "@/stores/auth-store";
import type { Order } from "@/types";

export function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
  const [searchParams] = useSearchParams();
  const t = useTranslation();
  const { i18n } = useI18nTranslation();
  const language = i18n.language as "ar" | "en";
  const { user } = useAuthStore();

  useEffect(() => {
    // Load orders from localStorage (in real app, this would be from API)
    const savedOrders = JSON.parse(
      localStorage.getItem("noqta-orders") || "[]"
    );

    // Sort by date descending (newest first)
    savedOrders.sort(
      (a: Order, b: Order) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Load saved status overrides (from Seller updates)
    const savedStatuses = JSON.parse(
      localStorage.getItem("orderStatuses") || "{}"
    );

    // Apply status overrides
    let syncedOrders = savedOrders.map((order: Order) => {
      if (savedStatuses[order.id]) {
        return { ...order, status: savedStatuses[order.id] };
      }
      return order;
    });

    // Filter by User ID
    if (user) {
      syncedOrders = syncedOrders.filter((o: Order) => o.userId === user.id);
    } else {
      syncedOrders = [];
    }

    // This is intentional: loading initial data from localStorage on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(() => syncedOrders);

    // Check for orderId in URL to expand automatically
    const orderIdToExpand = searchParams.get("orderId");
    if (orderIdToExpand) {
      setExpandedOrders((prev) => new Set(prev).add(orderIdToExpand));

      // Optional: Scroll to element after a short delay to ensure rendering
      setTimeout(() => {
        const element = document.getElementById(`order-${orderIdToExpand}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [searchParams, user]);

  const handleCancelOrderClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelDialog(true);
  };

  const confirmCancelOrder = () => {
    if (orderToCancel) {
      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToCancel ? { ...o, status: "cancelled" } : o
        )
      );

      // Update localStorage (Sync with Seller)
      const savedStatuses = JSON.parse(
        localStorage.getItem("orderStatuses") || "{}"
      );
      savedStatuses[orderToCancel] = "cancelled";
      localStorage.setItem("orderStatuses", JSON.stringify(savedStatuses));

      // Also update the main orders list status if possible
      const mainOrders = JSON.parse(
        localStorage.getItem("noqta-orders") || "[]"
      ) as Order[];
      const updatedMainOrders = mainOrders.map((o: Order) =>
        o.id === orderToCancel ? { ...o, status: "cancelled" } : o
      );
      localStorage.setItem("noqta-orders", JSON.stringify(updatedMainOrders));

      setShowCancelDialog(false);
      setOrderToCancel(null);
    }
  };

  const confirmCancelAllOrders = () => {
    const activeOrders = orders.filter(
      (o) => !["cancelled", "delivered", "refunded"].includes(o.status)
    );

    if (activeOrders.length === 0) {
      setShowCancelAllDialog(false);
      return;
    }

    // Update local state
    setOrders((prev) =>
      prev.map((o) =>
        !["cancelled", "delivered", "refunded"].includes(o.status)
          ? { ...o, status: "cancelled" }
          : o
      )
    );

    // Update localStorage (Sync with Seller)
    const savedStatuses = JSON.parse(
      localStorage.getItem("orderStatuses") || "{}"
    );
    const mainOrders = JSON.parse(localStorage.getItem("noqta-orders") || "[]") as Order[];

    activeOrders.forEach((order) => {
      savedStatuses[order.id] = "cancelled";
      // Update main list too
      const mainIndex = mainOrders.findIndex((o: Order) => o.id === order.id);
      if (mainIndex !== -1) mainOrders[mainIndex].status = "cancelled";
    });

    localStorage.setItem("orderStatuses", JSON.stringify(savedStatuses));
    localStorage.setItem("noqta-orders", JSON.stringify(mainOrders));

    setShowCancelAllDialog(false);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusLabel = (status: string) => {
    const statusKeys: Record<string, string> = {
      pending: "orders.pending",
      confirmed: "orders.confirmed",
      processing: "orders.processing",
      shipped: "orders.shipped",
      delivered: "orders.delivered",
      completed: "orders.completed",
      cancelled: "orders.cancelled",
      refunded: "orders.refunded",
    };
    return t(statusKeys[status] || status);
  };

  const getStatusColor = (status: string) => {
    // Matching Seller Dashboard Colors
    const colors: Record<string, string> = {
      pending:
        "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
      confirmed:
        "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
      processing:
        "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
      shipped:
        "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
      delivered:
        "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
      completed:
        "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
      cancelled: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
      refunded: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="h-4 w-4" />,
      confirmed: <CheckCircle2 className="h-4 w-4" />,
      processing: <Package className="h-4 w-4" />,
      shipped: <Truck className="h-4 w-4" />,
      delivered: <CheckCircle2 className="h-4 w-4" />,
      completed: <CheckCircle2 className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />,
      refunded: <XCircle className="h-4 w-4" />,
    };
    return icons[status] || icons.pending;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodKeys: Record<string, string> = {
      card: "payment.creditCard",
      wallet: "payment.digitalWallet",
      paypal: "PayPal",
      cash: "payment.cashOnDelivery",
    };
    return methodKeys[method] ? t(methodKeys[method]) : method;
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return ["pending", "confirmed", "processing", "shipped"].includes(
        order.status
      );
    if (activeTab === "completed")
      return ["delivered", "completed"].includes(order.status);
    if (activeTab === "cancelled")
      return ["cancelled", "refunded"].includes(order.status);
    return true;
  });

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("orders.title")}</h1>
        <EmptyState
          title={t("orders.noOrders")}
          description={t("orders.noOrdersDescription")}
          action={{
            label: t("cart.browseProducts"),
            onClick: () => {
              window.location.href = ROUTES.BUYER.SEARCH;
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
        <div className="text-sm text-muted-foreground hidden md:block">
          {orders.length} {t("orders.orderCount")}
          {orders.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Cancel All Action Area */}
      {orders.some(
        (o) => !["cancelled", "delivered", "refunded"].includes(o.status)
      ) && (
        <div className="mb-8 flex justify-end border-b pb-4">
          <button
            onClick={() => setShowCancelAllDialog(true)}
            className="text-destructive hover:text-white hover:bg-destructive text-sm font-medium flex items-center gap-2 border border-destructive rounded-md px-4 py-2 transition-all shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            {t("orders.cancelAllActive")}
          </button>
        </div>
      )}

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">{t("orders.all")}</TabsTrigger>
          <TabsTrigger value="active">{t("orders.active")}</TabsTrigger>
          <TabsTrigger value="completed">{t("orders.completed")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("orders.cancelled")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {t("orders.noOrdersInList")}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);

            return (
              <Card
                key={order.id}
                id={`order-${order.id}`}
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? "ring-1 ring-primary shadow-md"
                    : "hover:shadow-sm"
                }`}
              >
                <CardHeader className="bg-muted/30 py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base font-bold">
                          #{order.orderNumber}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString(
                              language === "ar" ? "ar-EG" : "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground">
                            {t("orders.totalLabel")} ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                        >
                          {isExpanded
                            ? t("orders.hideDetails")
                            : t("orders.showDetails")}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Products Section */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-sm border-b pb-2">
                          <Package className="h-4 w-4 text-primary" />
                          {t("orders.products")}
                        </h3>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between text-sm bg-muted/20 p-3 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-foreground/90">
                                  {item.product.name[language] ||
                                    item.product.name.en}
                                </p>
                                <p className="text-muted-foreground text-xs mt-1">
                                  {t("orders.quantity")} {item.quantity} × $
                                  {item.price.toFixed(2)}
                                </p>
                                {item.product.discount &&
                                  item.product.discount > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1 font-medium bg-green-50 w-fit px-1.5 py-0.5 rounded">
                                      <Tag className="h-3 w-3" />
                                      <span>
                                        {item.product.discount}%{" "}
                                        {t("orders.discount")}
                                      </span>
                                    </div>
                                  )}
                                {item.product.seller && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Store className="h-3 w-3" />
                                    <span>
                                      {item.product.seller?.storeName?.[
                                        language
                                      ] ||
                                        item.product.seller?.storeName?.en ||
                                        "Noqta Store"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="font-bold ml-2">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Payment Info */}
                      <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2 text-sm border-b pb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {t("orders.shippingAddress")}
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1 bg-muted/20 p-3 rounded-lg">
                            <p className="font-semibold text-foreground">
                              {order.shippingAddress.name}
                            </p>
                            <p>{order.shippingAddress.street}</p>
                            <p>
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state &&
                                `${order.shippingAddress.state}, `}
                              {order.shippingAddress.postalCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                              <p className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-muted-foreground/20">
                                <span className="font-medium">
                                  {t("orders.phone")}
                                </span>
                                <span dir="ltr">
                                  {order.shippingAddress.phone}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2 text-sm border-b pb-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            {t("orders.paymentMethod")}
                          </h3>
                          <div className="text-sm bg-muted/20 p-3 rounded-lg">
                            <p className="font-semibold">
                              {getPaymentMethodLabel(order.paymentMethod)}
                            </p>
                            {order.paymentDetails &&
                              order.paymentMethod === "card" &&
                              order.paymentDetails.card && (
                                <p className="text-muted-foreground text-xs mt-1 font-mono">
                                  **** **** ****{" "}
                                  {order.paymentDetails.card.number.slice(-4)}
                                </p>
                              )}
                            {order.paymentDetails &&
                              order.paymentMethod === "wallet" &&
                              order.paymentDetails.wallet && (
                                <p className="text-muted-foreground text-xs mt-1">
                                  {order.paymentDetails.wallet.mobile}
                                </p>
                              )}
                            {order.paymentDetails &&
                              order.paymentMethod === "paypal" &&
                              order.paymentDetails.paypal && (
                                <p className="text-muted-foreground text-xs mt-1">
                                  {order.paymentDetails.paypal.email}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary Footer */}
                    <div className="border-t border-dashed mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center bg-primary/5 -mx-6 -mb-6 px-6 py-4">
                      <div className="flex gap-4">
                        {![
                          "cancelled",
                          "shipped",
                          "delivered",
                          "refunded",
                        ].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrderClick(order.id)}
                            className="text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-2 rounded border border-destructive/30 flex items-center gap-2 transition-colors uppercase tracking-wider"
                          >
                            <Ban className="h-3 w-3" />
                            {t("orders.cancelOrder")}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-lg font-bold">
                        <span>{t("orders.total")}</span>
                        <span className="text-primary">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={confirmCancelOrder}
        title={t("orders.cancelOrderTitle")}
        description={t("orders.cancelOrderDescription")}
        confirmText={t("orders.yesCancelOrder")}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showCancelAllDialog}
        onOpenChange={setShowCancelAllDialog}
        onConfirm={confirmCancelAllOrders}
        title={t("orders.cancelAllOrders")}
        description={t("orders.cancelAllOrdersDescription")}
        confirmText={t("orders.confirmCancelAll")}
        variant="destructive"
      />
    </div>
  );
}
