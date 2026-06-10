export type Language = 'en' | 'zh' | 'ru';

export type Dictionary = {
    common: {
        appName: string;
        dashboard: string;
        adminPanel: string;
        login: string;
        register: string;
        logout: string;
        settings: string;
        wallet: string;
        shop: string;
        orders: string;
        loading: string;
    };
    settings: {
        title: string;
        subtitle: string;
        profile: string;
        displayName: string;
        managedByGoogle: string;
        email: string;
        role: string;
        preferences: string;
        language: string;
        languageDesc: string;
        notifications: string;
        notificationsDesc: string;
        configure: string;
    };
    home: {
        title: string;
        subtitle: string;
        buyNow: string;
        features: string;
        cities: {
            moscow: string;
            spb: string;
            irkutsk: string;
            vladivostok: string;
        };
        sections: {
            faq: string;
            software: string;
            other: string;
        };
        venues: {
            bolshoi: string;
            mariinsky: string;
            hermitage: string;
            peterhof: string;
            catherine_palace: string;
            moscow_circus: string;
            spb_circus: string;
            kremlin: string;
            moscow_river: string;
            spb_river: string;
            train_msk_spb: string;
            train_spb_msk: string;
        };
    };
    auth: {
        signInTitle: string;
        registerTitle: string;
        subtitle: string; // New
        emailLabel: string;
        passwordLabel: string;
        wechatLabel: string;
        telegramLabel: string;
        contactRequired: string;
        phoneLabel: string;
        codeLabel: string;
        sendCode: string;
        sending: string;
        signInBtn: string;
        registerBtn: string;
        noAccount: string;
        hasAccount: string;
        backToHome: string;
    };
    dashboard: {
        totalBalance: string;
        depositAddress: string;
        depositInstructions: string;
        refreshBalance: string;
        recentActivity: string;
        copy: string;
        copied: string;
        noActivity: string; // New
    };
    activity: {
        type: string;
        description: string;
        amount: string;
        status: string;
        date: string;
        deposit: string;
        purchase: string;
        delivery: string;
    };
    buy: {
        title: string;
        confirmTitle: string;
        productLabel: string;
        priceLabel: string;
        balanceLabel: string;
        confirmBtn: string;
        cancelBtn: string;
        success: string;
        error: string;
        insufficientBalance: string;
        processing: string;
        loginRequired: string;
        surname: string;
        givenName: string;
        phoneNumber: string;
        contactDetails: string;
        targetLink: string;
        targetLinkRequired: string;
        amount: string;
        additionalNotes: string;
        notesPlaceholder: string;
        back: string;
        selectDate: string;
        selectTimeSlot: string;
        noSlots: string;
        selectDateFirst: string;
        eventDetails: string;
        venue: string;
        calculating: string;
    };
    // ... existing ...
    orders: {
        title: string;
        subtitle: string;
        orderId: string;
        product: string;
        date: string;
        status: string;
        amount: string;
        booking: string;
        empty: string;
        deliveryContent: string;
        messageFromAdmin: string;
        refunded: string;
    };
    admin: {
        dashboard: string;
        products: string;
        orders: string;
        users: string;
        wallet: string;
        addProduct: string;
        productTitle: string;
        price: string;
        type: string;
        stock: string;
        actions: string;
        edit: string;
        delete: string;
        image: string;
        createProduct: string;
        save: string;
        saving: string;
        cancel: string;
        form: {
            type: string;
            title: string;
            description: string;
            price: string;
            stock: string;
            content: string;
            location: string;
            city: string;
            venue: string;
            virtual: string;
            attraction: string;
            theater: string;
            concierge: string;
            slotGen: string;
            startDate: string;
            endDate: string;
            activeDays: string;
            startTime: string;
            endTime: string;
            interval: string;
            generate: string;
            generated: string;
            verify: string;
            contentHelp: string;
            imageLabel: string;
            uploadButton: string;
        }
    };
};

export const dictionaries: Record<Language, Dictionary> = {
    en: {
        common: {
            appName: "V-Ticket Shop",
            dashboard: "Dashboard",
            adminPanel: "Admin Panel",
            login: "Login",
            register: "Register",
            logout: "Logout",
            settings: "Settings",
            wallet: "Wallet",
            shop: "Shop",
            orders: "My Orders",
            loading: "Loading..."
        },
        home: {
            title: "Premium Virtual Goods",
            subtitle: "Secure, instant, and reliable access to exclusive digital content.",
            buyNow: "Buy Now",
            features: "Features",
            cities: {
                moscow: "Moscow",
                spb: "Saint Petersburg",
                irkutsk: "Irkutsk",
                vladivostok: "Vladivostok"
            },
            sections: {
                faq: "FAQ & Tutorials",
                software: "Software & Tutorials",
                other: "Other Services"
            },
            venues: {
                bolshoi: "Bolshoi Theatre",
                mariinsky: "Mariinsky Theatre",
                hermitage: "The Hermitage (Winter Palace)",
                peterhof: "Peterhof (Summer Palace)",
                catherine_palace: "Catherine Palace",
                moscow_circus: "Moscow Circus",
                spb_circus: "Saint Petersburg Circus",
                kremlin: "Kremlin & Armory",
                moscow_river: "Moscow River Cruise",
                spb_river: "Saint Petersburg River Cruise",
                train_msk_spb: "Train Moscow - St.Petersburg",
                train_spb_msk: "Train St.Petersburg - Moscow"
            }
        },
        auth: {
            signInTitle: "Sign in to your account",
            registerTitle: "Create an account",
            subtitle: "Enter your details below to create your account",
            emailLabel: "Email",
            passwordLabel: "Password",
            wechatLabel: "WeChat ID",
            telegramLabel: "Telegram ID",
            contactRequired: "Please provide at least one: WeChat ID or Telegram ID",
            phoneLabel: "Phone Number",
            codeLabel: "Verification Code",
            sendCode: "Send Code",
            sending: "Sending...",
            signInBtn: "Sign In",
            registerBtn: "Sign Up",
            noAccount: "Don't have an account?",
            hasAccount: "Already have an account?",
            backToHome: "Back to Home"
        },
        dashboard: {
            totalBalance: "Total Balance",
            depositAddress: "Your Deposit Address (BSC)",
            depositInstructions: "Send USDT/USDC (BEP20) to this address to top up.",
            refreshBalance: "Refresh Balance",
            recentActivity: "Recent Activity",
            copy: "Copy",
            copied: "Copied!",
            noActivity: "No recent activity."
        },
        activity: {
            type: "Type",
            description: "Description",
            amount: "Amount",
            status: "Status",
            date: "Date",
            deposit: "Deposit",
            purchase: "Purchase",
            delivery: "Delivery"
        },
        buy: {
            title: "Purchase Product",
            confirmTitle: "Confirm Purchase",
            productLabel: "Product",
            priceLabel: "Price",
            balanceLabel: "Your Balance",
            confirmBtn: "Confirm Purchase",
            cancelBtn: "Cancel",
            success: "Purchase successful!",
            error: "Purchase failed",
            insufficientBalance: "Insufficient balance. Please top up.",
            processing: "Processing...",
            loginRequired: "Please login to purchase",
            surname: "Surname (Pinyin)",
            givenName: "Given Name (Pinyin)",
            phoneNumber: "Phone Number",
            contactDetails: "Contact Details",
            targetLink: "Target Link (Item to buy)",
            targetLinkRequired: "Target Link is required",
            amount: "Amount",
            additionalNotes: "Additional Notes",
            notesPlaceholder: "Seat preference, account details, etc...",
            back: "Back",
            selectDate: "Select Date",
            selectTimeSlot: "Select Time Slot",
            noSlots: "No slots available for this date.",
            selectDateFirst: "Please select a date to see available slots.",
            eventDetails: "Event Details",
            venue: "Venue",
            calculating: "Calculating..."
        },
        orders: {
            title: "My Orders",
            subtitle: "View and manage your purchase history",
            orderId: "Order ID",
            product: "Product",
            date: "Date",
            status: "Status",
            amount: "Amount",
            booking: "Booking",
            empty: "You haven't placed any orders yet.",
            deliveryContent: "Delivery Content",
            messageFromAdmin: "Message from Admin",
            refunded: "Refunded"
        },
        settings: {
            title: "Settings",
            subtitle: "Manage your account settings and preferences.",
            profile: "Profile",
            displayName: "Display Name",
            managedByGoogle: "Managed by your Google Account.",
            email: "Email",
            role: "Account Role",
            preferences: "Preferences",
            language: "Language",
            languageDesc: "Select your preferred language for the interface.",
            notifications: "Notifications (Coming Soon)",
            notificationsDesc: "Receive email updates about your orders.",
            configure: "Configure"
        },
        admin: {
            dashboard: "Dashboard",
            products: "Products",
            orders: "Orders",
            users: "Users",
            wallet: "Wallet",
            addProduct: "Add New Product",
            productTitle: "Product Name",
            price: "Price",
            type: "Type",
            stock: "Stock",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            image: "Image",
            createProduct: "Create Product",
            save: "Save",
            saving: "Saving...",
            cancel: "Cancel",
            form: {
                type: "Product Type",
                title: "Title",
                description: "Description",
                price: "Price",
                stock: "Stock",
                content: "Virtual Content (Delivery)",
                location: "Location / Address",
                city: "City",
                venue: "Venue / Hall",
                virtual: "Virtual Product (Standard)",
                attraction: "Attraction Ticket",
                theater: "Theater Ticket",
                concierge: "Concierge Service",
                slotGen: "Slot Generator",
                startDate: "Start Date",
                endDate: "End Date",
                activeDays: "Active Days",
                startTime: "Start Time",
                endTime: "End Time",
                interval: "Interval (min)",
                generate: "Generate Slots",
                generated: "Generated Slots (Editable)",
                verify: "Verify and remove any specific dates if closed.",
                contentHelp: "Hidden until purchased. For tickets, you might verify this manually later.",
                imageLabel: "Product Image",
                uploadButton: "Upload Image"
            }
        }
    },
    zh: {
        common: {
            appName: "V-Ticket 商城",
            dashboard: "仪表盘",
            adminPanel: "管理后台",
            login: "登录",
            register: "注册",
            logout: "退出",
            settings: "设置",
            wallet: "钱包",
            shop: "商店",
            orders: "我的订单",
            loading: "加载中..."
        },
        home: {
            title: "高级虚拟商品",
            subtitle: "安全、即时、可靠的独家数字内容获取渠道",
            buyNow: "立即购买",
            features: "特色功能",
            cities: {
                moscow: "莫斯科",
                spb: "圣彼得堡",
                irkutsk: "伊尔库茨克",
                vladivostok: "海参崴"
            },
            sections: {
                faq: "常见问题及教程",
                software: "常用软件及教程",
                other: "其他业务"
            },
            venues: {
                bolshoi: "莫斯科大剧院",
                mariinsky: "马林斯基剧院",
                hermitage: "冬宫 (艾尔米塔什博物馆)",
                peterhof: "夏宫 (彼得霍夫宫)",
                catherine_palace: "叶卡捷琳娜宫 (琥珀屋)",
                moscow_circus: "莫斯科大马戏",
                spb_circus: "圣彼得堡马戏团",
                kremlin: "克里姆林宫及武器库",
                moscow_river: "莫斯科河游船",
                spb_river: "圣彼得堡涅瓦河游船",
                train_msk_spb: "莫斯科-圣彼得堡火车",
                train_spb_msk: "圣彼得堡-莫斯科火车"
            }
        },
        auth: {
            signInTitle: "登录您的账户",
            registerTitle: "创建新账户",
            subtitle: "请输入您的详细信息以创建账户",
            emailLabel: "邮箱",
            passwordLabel: "密码",
            wechatLabel: "微信号",
            telegramLabel: "Telegram ID (电报)",
            contactRequired: "微信号和 Telegram ID 至少填写一个",
            phoneLabel: "手机号",
            codeLabel: "验证码",
            sendCode: "发送验证码",
            sending: "发送中...",
            signInBtn: "登录",
            registerBtn: "注册",
            noAccount: "还没有账户？",
            hasAccount: "已有账户？",
            backToHome: "返回首页"
        },
        dashboard: {
            totalBalance: "总余额",
            depositAddress: "充值地址 (BSC)",
            depositInstructions: "发送 USDT/USDC (BEP20) 到此地址进行充值。",
            refreshBalance: "刷新余额",
            recentActivity: "近期活动",
            copy: "复制",
            copied: "已复制!",
            noActivity: "暂无近期活动。"
        },
        activity: {
            type: "类型",
            description: "描述",
            amount: "金额",
            status: "状态",
            date: "日期",
            deposit: "存款",
            purchase: "购买",
            delivery: "发货内容"
        },
        buy: {
            title: "购买商品",
            confirmTitle: "确认购买",
            productLabel: "商品",
            priceLabel: "价格",
            balanceLabel: "您的余额",
            confirmBtn: "确认支付",
            cancelBtn: "取消",
            success: "购买成功!",
            error: "购买失败",
            insufficientBalance: "余额不足，请先充值。",
            processing: "处理中...",
            loginRequired: "请登录后购买",
            surname: "姓 (拼音)",
            givenName: "名 (拼音)",
            phoneNumber: "手机号",
            contactDetails: "联系人信息",
            targetLink: "目标链接 (购买商品)",
            targetLinkRequired: "请提供目标链接",
            amount: "金额",
            additionalNotes: "备注信息",
            notesPlaceholder: "座位偏好、账号信息等...",
            back: "返回",
            selectDate: "选择日期",
            selectTimeSlot: "选择时间段",
            noSlots: "该日期无可用时段。",
            selectDateFirst: "请选择日期以查看可用时段。",
            eventDetails: "活动详情",
            venue: "地点",
            calculating: "计算中..."
        },
        orders: {
            title: "我的订单",
            subtitle: "查看和管理您的购买记录",
            orderId: "订单号",
            product: "商品",
            date: "日期",
            status: "状态",
            amount: "金额",
            booking: "预订时间",
            empty: "您还没有下过订单。",
            deliveryContent: "发货内容",
            messageFromAdmin: "管理员留言",
            refunded: "已退款"
        },
        settings: {
            title: "设置",
            subtitle: "管理您的账户设置和偏好。",
            profile: "个人资料",
            displayName: "显示名称",
            managedByGoogle: "由您的 Google 账户管理。",
            email: "邮箱",
            role: "账户角色",
            preferences: "偏好设置",
            language: "语言",
            languageDesc: "选择您偏好的界面语言。",
            notifications: "通知 (即将推出)",
            notificationsDesc: "接收关于订单的电子邮件更新。",
            configure: "配置"
        },
        admin: {
            dashboard: "仪表盘",
            products: "商品管理",
            orders: "订单管理",
            users: "用户管理",
            wallet: "钱包管理",
            addProduct: "添加新商品",
            productTitle: "商品名称",
            price: "价格",
            type: "类型",
            stock: "库存",
            actions: "操作",
            edit: "编辑",
            delete: "删除",
            image: "图片",
            createProduct: "创建商品",
            save: "保存",
            saving: "保存中...",
            cancel: "取消",
            form: {
                type: "商品类型",
                title: "标题",
                description: "描述",
                price: "价格",
                stock: "库存",
                content: "虚拟内容 (发货)",
                location: "地点 / 地址",
                city: "城市",
                venue: "场馆 / 厅",
                virtual: "虚拟商品 (标准)",
                attraction: "景点门票",
                theater: "剧院门票",
                concierge: "代买服务",
                slotGen: "时段生成器",
                startDate: "开始日期",
                endDate: "结束日期",
                activeDays: "活动日",
                startTime: "开始时间",
                endTime: "结束时间",
                interval: "间隔 (分钟)",
                generate: "生成时段",
                generated: "已生成时段 (可编辑)",
                verify: "请核对并移除关闭的特定日期。",
                contentHelp: "购买前隐藏。对于门票，您可以稍后手动核实。",
                imageLabel: "商品图片",
                uploadButton: "上传图片"
            }
        }
    },
    ru: {
        common: {
            appName: "Магазин V-Ticket",
            dashboard: "Кабинет",
            adminPanel: "Админка",
            login: "Вход",
            register: "Регистрация",
            logout: "Выйти",
            settings: "Настройки",
            wallet: "Кошелек",
            shop: "Магазин",
            orders: "Мои заказы",
            loading: "Загрузка..."
        },
        home: {
            title: "Премиальные виртуальные товары",
            subtitle: "Безопасный, мгновенный и надежный доступ к цифровому контенту",
            buyNow: "Купить",
            features: "Особенности",
            cities: {
                moscow: "Москва",
                spb: "Санкт-Петербург",
                irkutsk: "Иркутск",
                vladivostok: "Владивосток"
            },
            sections: {
                faq: "Частые вопросы и уроки",
                software: "Программы и уроки",
                other: "Другие услуги"
            },
            venues: {
                bolshoi: "Большой театр",
                mariinsky: "Мариинский театр",
                hermitage: "Эрмитаж (Зимний дворец)",
                peterhof: "Петергоф (Летний дворец)",
                catherine_palace: "Екатерининский дворец",
                moscow_circus: "Московский цирк",
                spb_circus: "Цирк Санкт-Петербурга",
                kremlin: "Кремль и Оружейная палата",
                moscow_river: "Круиз по Москве-реке",
                spb_river: "Круиз по Неве",
                train_msk_spb: "Поезд Москва - СПб",
                train_spb_msk: "Поезд СПб - Москва"
            }
        },
        auth: {
            signInTitle: "Войти в аккаунт",
            registerTitle: "Создать аккаунт",
            subtitle: "Введите свои данные ниже, чтобы создать аккаунт",
            emailLabel: "Email",
            passwordLabel: "Пароль",
            wechatLabel: "WeChat ID",
            telegramLabel: "Telegram ID",
            contactRequired: "Укажите хотя бы один: WeChat ID или Telegram ID",
            phoneLabel: "Номер телефона",
            codeLabel: "Код подтверждения",
            sendCode: "Отправить код",
            sending: "Отправка...",
            signInBtn: "Войти",
            registerBtn: "Регистрация",
            noAccount: "Нет аккаунта?",
            hasAccount: "Уже есть аккаунт?",
            backToHome: "На главную"
        },
        dashboard: {
            totalBalance: "Общий баланс",
            depositAddress: "Адрес для пополнения (BSC)",
            depositInstructions: "Отправьте USDT/USDC (BEP20) на этот адрес.",
            refreshBalance: "Обновить баланс",
            recentActivity: "Последняя активность",
            copy: "Копировать",
            copied: "Скопировано!",
            noActivity: "Нет недавней активности."
        },
        activity: {
            type: "Тип",
            description: "Описание",
            amount: "Сумма",
            status: "Статус",
            date: "Дата",
            deposit: "Пополнение",
            purchase: "Покупка",
            delivery: "Доставка"
        },
        buy: {
            title: "Покупка товара",
            confirmTitle: "Подтверждение",
            productLabel: "Товар",
            priceLabel: "Цена",
            balanceLabel: "Ваш баланс",
            confirmBtn: "Подтвердить",
            cancelBtn: "Отмена",
            success: "Покупка успешна!",
            error: "Ошибка покупки",
            insufficientBalance: "Недостаточно средств. Пополните баланс.",
            processing: "Обработка...",
            loginRequired: "Войдите для покупки",
            surname: "Фамилия (Pinyin)",
            givenName: "Имя (Pinyin)",
            phoneNumber: "Номер телефона",
            contactDetails: "Контактные данные",
            targetLink: "Целевая ссылка (товар для покупки)",
            targetLinkRequired: "Требуется целевая ссылка",
            amount: "Сумма",
            additionalNotes: "Дополнительные примечания",
            notesPlaceholder: "Предпочтения по местам, данные аккаунта и т.д...",
            back: "Назад",
            selectDate: "Выберите дату",
            selectTimeSlot: "Выберите время",
            noSlots: "Нет доступных слотов на эту дату.",
            selectDateFirst: "Выберите дату, чтобы увидеть доступные слоты.",
            eventDetails: "Детали мероприятия",
            venue: "Место проведения",
            calculating: "Расчет..."
        },
        orders: {
            title: "Мои заказы",
            subtitle: "Просмотр и управление историей покупок",
            orderId: "ID заказа",
            product: "Товар",
            date: "Дата",
            status: "Статус",
            amount: "Сумма",
            booking: "Бронь",
            empty: "Вы еще не делали заказов.",
            deliveryContent: "Информация о доставке",
            messageFromAdmin: "Сообщение от админа",
            refunded: "Возврат"
        },
        settings: {
            title: "Настройки",
            subtitle: "Управление настройками аккаунта.",
            profile: "Профиль",
            displayName: "Имя",
            managedByGoogle: "Управляется через Google аккаунт.",
            email: "Email",
            role: "Роль",
            preferences: "Настройки",
            language: "Язык",
            languageDesc: "Выберите язык интерфейса.",
            notifications: "Уведомления (Скоро)",
            notificationsDesc: "Получать письма о заказах.",
            configure: "Настроить"
        },
        admin: {
            dashboard: "Кабинет",
            products: "Товары",
            orders: "Заказы",
            users: "Пользователи",
            wallet: "Кошелек",
            addProduct: "Добавить товар",
            productTitle: "Название",
            price: "Цена",
            type: "Тип",
            stock: "Склад",
            actions: "Действия",
            edit: "Изменить",
            delete: "Удалить",
            image: "Изображение",
            createProduct: "Создать",
            save: "Сохранить",
            saving: "Сохранение...",
            cancel: "Отмена",
            form: {
                type: "Тип товара",
                title: "Название",
                description: "Описание",
                price: "Цена",
                stock: "Количество",
                content: "Контент (Доставка)",
                location: "Местоположение",
                city: "Город",
                venue: "Зал / Место",
                virtual: "Виртуальный (Стандарт)",
                attraction: "Билет (Attraction)",
                theater: "Билет (Theater)",
                concierge: "Консьерж-сервис",
                slotGen: "Генератор слотов",
                startDate: "Начало",
                endDate: "Конец",
                activeDays: "Дни активности",
                startTime: "Время начала",
                endTime: "Время конца",
                interval: "Интервал (мин)",
                generate: "Создать слоты",
                generated: "Созданные слоты",
                verify: "Проверьте и удалите лишние.",
                contentHelp: "Скрыто до покупки. Можно заполнить позже.",
                imageLabel: "Изображение товара",
                uploadButton: "Загрузить изображение"
            }
        }
    }
};
