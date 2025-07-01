// الانتقال من صفحة الطاولة إلى القائمة
function startOrder() {
    const tableNumber = document.getElementById('tableNumber').value;
    if (tableNumber && tableNumber > 0) {
        localStorage.setItem('currentTable', tableNumber);
        window.location.href = 'menu.html';
    } else {
        alert('الرجاء إدخال رقم طاولة صحيح');
    }
}

// تطبيق Vue.js لصفحة القائمة
if (window.location.pathname.endsWith('menu.html')) {
    new Vue({
        el: '#app',
        data: {
            tableNumber: localStorage.getItem('currentTable') || 1,
            products: [],
            currentCategory: 'جميع الفئات',
            cart: [],
            notes: {}
        },
        created() {
            this.fetchProducts();
        },
        computed: {
            categories() {
                const cats = ['جميع الفئات', ...new Set(this.products.map(p => p.category))];
                return cats;
            },
            filteredProducts() {
                if (this.currentCategory === 'جميع الفئات') {
                    return this.products;
                }
                return this.products.filter(p => p.category === this.currentCategory);
            },
            total() {
                return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
        },
        methods: {
            fetchProducts() {
                // في الواقع، هذا سيكون طلب API إلى الخادم
                // هنا نستخدم بيانات افتراضية لأغراض التطوير
                this.products = [
                    {id: 1, name: 'إسبريسو', price: 30, category: 'مشروبات ساخنة', image: 'espresso.jpg'},
                    {id: 2, name: 'كابتشينو', price: 35, category: 'مشروبات ساخنة', image: 'cappuccino.jpg'},
                    {id: 3, name: 'آيس كوفي', price: 40, category: 'مشروبات باردة', image: 'ice-coffee.jpg'},
                    {id: 4, name: 'كيك الشوكولاتة', price: 50, category: 'حلويات', image: 'chocolate-cake.jpg'},
                    {id: 5, name: 'شاي بالنعناع', price: 25, category: 'مشروبات ساخنة', image: 'mint-tea.jpg'},
                    {id: 6, name: 'عصير برتقال', price: 30, category: 'عصائر', image: 'orange-juice.jpg'}
                ];
            },
            setCategory(category) {
                this.currentCategory = category;
            },
            increaseQuantity(product) {
                const existingItem = this.cart.find(item => item.id === product.id);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    this.cart.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        notes: this.notes[product.id] || ''
                    });
                }
            },
            decreaseQuantity(product) {
                const existingItem = this.cart.find(item => item.id === product.id);
                if (existingItem) {
                    existingItem.quantity--;
                    if (existingItem.quantity <= 0) {
                        this.cart = this.cart.filter(item => item.id !== product.id);
                    }
                }
            },
            getQuantity(productId) {
                const item = this.cart.find(item => item.id === productId);
                return item ? item.quantity : 0;
            },
            submitOrder() {
                const order = {
                    tableNumber: parseInt(this.tableNumber),
                    items: this.cart.map(item => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        notes: item.notes
                    })),
                    status: 'new',
                    createdAt: new Date().toISOString(),
                    completed: false
                };

                // إرسال الطلب إلى Firebase
                database.ref('orders').push(order)
                    .then(() => {
                        alert('تم إرسال طلبك بنجاح!');
                        this.cart = [];
                        this.notes = {};
                    })
                    .catch(error => {
                        console.error('Error submitting order:', error);
                        alert('حدث خطأ أثناء إرسال الطلب');
                    });
            },
            exitOrder() {
                localStorage.removeItem('currentTable');
                window.location.href = 'index.html';
            }
        }
    });
}
