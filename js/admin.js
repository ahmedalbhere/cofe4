// التحقق من تسجيل الدخول
if (!localStorage.getItem('adminLoggedIn') && !window.location.pathname.includes('index.html')) {
    window.location.href = 'index.html';
}

new Vue({
    el: '#app',
    data: {
        orders: [],
        loading: true,
        orderFilter: 'active',
        cafeName: 'قهوة الفراشة',
        cafeNameInput: 'قهوة الفراشة'
    },
    created() {
        this.fetchOrders();
        this.fetchCafeName();
    },
    computed: {
        filteredOrders() {
            if (this.orderFilter === 'all') {
                return this.orders;
            } else if (this.orderFilter === 'active') {
                return this.orders.filter(order => !order.completed);
            } else {
                return this.orders.filter(order => order.completed);
            }
        }
    },
    methods: {
        fetchOrders() {
            this.loading = true;
            database.ref('orders').on('value', (snapshot) => {
                const ordersData = snapshot.val();
                this.orders = [];
                
                if (ordersData) {
                    for (const id in ordersData) {
                        this.orders.push({
                            id,
                            ...ordersData[id]
                        });
                    }
                    
                    // ترتيب الطلبات حسب الأحدث
                    this.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }
                
                this.loading = false;
            });
        },
        fetchCafeName() {
            database.ref('settings/cafeName').on('value', (snapshot) => {
                this.cafeName = snapshot.val() || 'قهوة الفراشة';
                this.cafeNameInput = this.cafeName;
            });
        },
        formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString('ar-EG');
        },
        calculateOrderTotal(order) {
            return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        completeOrder(orderId) {
            database.ref('orders/' + orderId).update({
                completed: true,
                completedAt: new Date().toISOString()
            });
        },
        updateCafeName() {
            if (this.cafeNameInput.trim()) {
                database.ref('settings').update({
                    cafeName: this.cafeNameInput
                }).then(() => {
                    alert('تم تحديث اسم المقهى بنجاح');
                });
            }
        },
        logout() {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'index.html';
        }
    }
});
