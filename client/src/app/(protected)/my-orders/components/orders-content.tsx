'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCancelOrder, useMyOrders } from '@/hooks/use-orders';
import { useCreateStripeCheckout } from '@/hooks/use-payment';
import Loader from '@/components/loader';
import { OrdersFilterParams, OrderStatus, PaymentMethod, IOrder } from '@/types/order';
import { ROUTE_CONFIG } from '@/configs/routes';
import EmptyState from './empty-state';
import OrderCard from './order-card';
import OrderFilters from './order-filters';
import PageHeader from './page-header';
import Pagination from './pagination';

// Orders content component (data-heavy, interactive) - Arrow function
const OrdersContent = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Build filter params
  const filterParams: OrdersFilterParams = {
    page: currentPage,
    limit: 5,
    ...(statusFilter !== 'all' && {
      status: statusFilter.toUpperCase() as OrderStatus,
    }),
  };

  const { data, isLoading } = useMyOrders(filterParams);

  const cancelOrderMutation = useCancelOrder();
  const createStripeCheckout = useCreateStripeCheckout();

  // Handle payment - Arrow function
  const handlePayment = (orderId: string, orderCode: string, paymentMethod: PaymentMethod) => {
    if (paymentMethod === PaymentMethod.STRIPE) {
      // Handle Stripe payment using PaymentService
      if (!orderCode) {
        toast.error('Order code not found');
        return;
      }

      createStripeCheckout.mutate(
        { orderCode },
        {
          onSuccess: (stripeResponse) => {
            const sessionUrl = stripeResponse?.sessionUrl;
            if (sessionUrl) {
              window.location.href = sessionUrl;
            } else {
              toast.error('Failed to get checkout URL');
            }
          },
        },
      );
    } else if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      // Handle bank transfer payment - redirect to QR payment page
      router.push(`${ROUTE_CONFIG.QR_PAYMENT}?orderid=${orderId}`);
    }
  };

  // Handle cancel order - Arrow function
  const handleCancelOrder = (orderId: string, orderCode: string) => {
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => {
        toast.success(`Order ${orderCode} has been successfully cancelled`);
      },
    });
  };

  // Handle page change - Arrow function
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle explore - Arrow function
  const handleExplore = () => {
    router.push('/');
  };

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  const orders = data?.result || [];
  const pagination = data?.meta;
  console.log('pagination', pagination);

  return (
    <>
      {/* Updated Page Header with actual orders count */}
      <PageHeader ordersCount={orders.length} />

      {/* Filters */}
      <OrderFilters
        statusFilter={statusFilter}
        ordersCount={orders.length}
        totalOrders={pagination?.totalItems || 0}
        onStatusChange={setStatusFilter}
      />

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState onExplore={handleExplore} />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order: IOrder) => (
            <OrderCard
              key={order.id}
              order={order}
              onPayment={handlePayment}
              onCancel={handleCancelOrder}
              cancelMutation={cancelOrderMutation}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          pagination={{
            ...pagination,
            hasNextPage: pagination.hasNextPage ?? false,
            hasPrevPage: pagination.hasPrevPage ?? false,
          }}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default OrdersContent;
