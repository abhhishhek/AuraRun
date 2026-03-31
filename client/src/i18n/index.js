import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      home: 'Home', products: 'Products', cart: 'Cart', wishlist: 'Wishlist',
      login: 'Login', register: 'Sign Up', logout: 'Logout',
      addToCart: 'Add to Cart', buyNow: 'Buy Now',
      outOfStock: 'Out of Stock', inStock: 'In Stock',
      orders: 'My Orders', profile: 'Profile',
      search: 'Search products...', filter: 'Filters',
      price: 'Price', rating: 'Rating', reviews: 'Reviews',
      total: 'Total', subtotal: 'Subtotal', shipping: 'Shipping',
      checkout: 'Proceed to Checkout', placeOrder: 'Place Order',
      orderPlaced: 'Order Placed', processing: 'Processing',
      shipped: 'Shipped', delivered: 'Delivered',
    }
  },
  hi: {
    translation: {
      home: 'होम', products: 'उत्पाद', cart: 'कार्ट', wishlist: 'विशलिस्ट',
      login: 'लॉगिन', register: 'साइन अप', logout: 'लॉगआउट',
      addToCart: 'कार्ट में जोड़ें', buyNow: 'अभी खरीदें',
      outOfStock: 'स्टॉक नहीं है', inStock: 'स्टॉक में है',
      orders: 'मेरे ऑर्डर', profile: 'प्रोफ़ाइल',
      search: 'उत्पाद खोजें...', filter: 'फ़िल्टर',
      price: 'कीमत', rating: 'रेटिंग', reviews: 'समीक्षाएं',
      total: 'कुल', subtotal: 'उप-कुल', shipping: 'शिपिंग',
      checkout: 'चेकआउट करें', placeOrder: 'ऑर्डर दें',
      orderPlaced: 'ऑर्डर दिया गया', processing: 'प्रोसेसिंग',
      shipped: 'भेजा गया', delivered: 'डिलीवर हुआ',
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
