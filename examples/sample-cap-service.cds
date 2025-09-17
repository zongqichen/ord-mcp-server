namespace com.example.bookshop;

using { cuid, managed } from '@sap/cds/common';

/**
 * Bookshop Service with ORD annotations
 * This example shows how to annotate CAP services for ORD discovery
 */
@path: '/api/bookshop'
@ORD.Extensions.product: 'sap.sample:product:bookshop:v1'
@ORD.Extensions.capability: 'sap.sample:capability:bookshop:v1'
@ORD.Extensions.apiResource: {
  ordId: 'sap.sample:apiResource:bookshop:v1',
  title: 'Bookshop API',
  shortDescription: 'API for managing books and orders',
  description: 'Complete API for bookshop operations including book catalog management and order processing',
  visibility: 'public',
  releaseStatus: 'active',
  systemInstanceAware: true,
  apiProtocol: 'odata-v4',
  tags: ['books', 'retail', 'catalog'],
  countries: ['US', 'DE', 'UK'],
  lineOfBusiness: ['Sales'],
  industry: ['Retail'],
  implementationStandard: 'sap.s4:apiResource:books:v1'
}
service BookshopService {

  /**
   * Books entity with comprehensive metadata
   */
  entity Books : cuid, managed {
    title       : String(100) @title: 'Title';
    descr       : String(1000) @title: 'Description';
    author      : String(100) @title: 'Author';
    genre       : String(50) @title: 'Genre';
    stock       : Integer @title: 'Stock';
    price       : Decimal(9,2) @title: 'Price';
    currency    : String(3) @title: 'Currency';
    ISBN        : String(20) @title: 'ISBN';
    publishedAt : Date @title: 'Publication Date';
    publisher   : String(100) @title: 'Publisher';
    
    // Navigation to orders
    orders      : Composition of many Orders on orders.book = $self;
  }

  /**
   * Orders entity
   */
  entity Orders : cuid, managed {
    book        : Association to Books;
    quantity    : Integer @title: 'Quantity';
    buyer       : String(100) @title: 'Buyer';
    OrderNo     : String(20) @title: 'Order Number';
    total       : Decimal(9,2) @title: 'Total Amount';
    currency    : String(3) @title: 'Currency';
    status      : String(20) @title: 'Status' enum {
      submitted; confirmed; shipped; delivered; cancelled;
    };
  }

  /**
   * Authors view for catalog purposes
   */
  @readonly
  entity Authors as projection on Books {
    author,
    count(*) as bookCount : Integer @title: 'Number of Books'
  } group by author;

  /**
   * Submit order action
   */
  action submitOrder(book: Books:ID, quantity: Integer) returns Orders;
  
  /**
   * Cancel order action
   */
  action cancelOrder(order: Orders:ID) returns String;

  /**
   * Get book recommendations function
   */
  function getRecommendations(genre: String, limit: Integer) returns array of Books;
}

/**
 * Events for order processing with ORD annotations
 */
@ORD.Extensions.eventResource: {
  ordId: 'sap.sample:eventResource:bookOrdered:v1',
  title: 'Book Ordered Event',
  shortDescription: 'Event published when a book is ordered',
  description: 'Detailed event containing order information for downstream processing',
  visibility: 'public',
  releaseStatus: 'active',
  version: '1.0.0',
  eventType: 'business-event',
  category: 'domain-event'
}
event BookOrdered {
  orderId     : String(36) @title: 'Order ID';
  bookId      : String(36) @title: 'Book ID';
  bookTitle   : String(100) @title: 'Book Title';
  quantity    : Integer @title: 'Quantity';
  totalAmount : Decimal(9,2) @title: 'Total Amount'; 
  currency    : String(3) @title: 'Currency';
  buyer       : String(100) @title: 'Buyer';
  timestamp   : Timestamp @title: 'Order Timestamp';
}

@ORD.Extensions.eventResource: {
  ordId: 'sap.sample:eventResource:bookShipped:v1',
  title: 'Book Shipped Event',
  shortDescription: 'Event published when a book order is shipped',
  description: 'Event containing shipping information for order tracking',
  visibility: 'public',
  releaseStatus: 'active',
  version: '1.0.0',
  eventType: 'business-event',
  category: 'domain-event'
}
event BookShipped {
  orderId      : String(36) @title: 'Order ID';
  trackingNo   : String(50) @title: 'Tracking Number';
  carrier      : String(50) @title: 'Shipping Carrier';
  estimatedDelivery : Date @title: 'Estimated Delivery Date';
  timestamp    : Timestamp @title: 'Shipping Timestamp';
}

/**
 * Analytics Service with separate ORD configuration
 */
@path: '/api/analytics'
@ORD.Extensions.apiResource: {
  ordId: 'sap.sample:apiResource:bookshopAnalytics:v1',
  title: 'Bookshop Analytics API',
  shortDescription: 'Analytics and reporting API for bookshop data',
  description: 'Provides aggregated data and analytics for business intelligence and reporting',
  visibility: 'internal',
  releaseStatus: 'beta',
  version: '1.0.0-beta',
  apiProtocol: 'odata-v4',
  tags: ['analytics', 'reporting', 'business-intelligence'],
  systemInstanceAware: false
}
service AnalyticsService {
  
  @readonly
  entity SalesAnalytics as projection on BookshopService.Orders {
    book.genre,
    book.author,
    sum(total) as totalSales : Decimal(15,2) @title: 'Total Sales',
    count(*) as orderCount : Integer @title: 'Number of Orders',
    avg(total) as avgOrderValue : Decimal(9,2) @title: 'Average Order Value'
  } group by book.genre, book.author;

  @readonly  
  entity MonthlyStats as projection on BookshopService.Orders {
    month(modifiedAt) as month : Integer @title: 'Month',
    year(modifiedAt) as year : Integer @title: 'Year',
    sum(total) as revenue : Decimal(15,2) @title: 'Revenue',
    count(*) as orders : Integer @title: 'Orders'
  } group by month(modifiedAt), year(modifiedAt);
}
