// src/components/common/FormatUtils.jsx

// Translation dictionary
const translations = {
  en: {
    // Navigation
    browse_venues: 'Browse Venues',
    map_view: 'Map View',
    add_venue: 'Add Venue',
    my_bookings: 'My Bookings',
    my_venues: 'My Venues',
    my_favorites: 'My Favorites',
    messages: 'Messages',
    profile: 'Profile',
    vendor_marketplace: 'Vendor Marketplace',
    join_as_vendor: 'Join as Vendor',

    // Home page
    welcome: 'Find Your Perfect Event Venue',
    hero_subtitle: 'Discover and book amazing venues for your special events',
    features_title: 'Why Choose Party2Book?',
    features_subtitle: 'Everything you need for a perfect event booking experience',
    feature_easy_discovery_title: 'Easy Discovery',
    feature_easy_discovery_desc: 'Find the perfect venue with powerful search and filters',
    feature_secure_booking_title: 'Secure Booking',
    feature_secure_booking_desc: 'Safe payments and guaranteed reservations',
    feature_support_title: '24/7 Support',
    feature_support_desc: 'Get help whenever you need it from our dedicated team',

    // Statistics
    stat_premium_venues: 'Premium Venues',
    stat_successful_bookings: 'Successful Bookings',
    stat_cities: 'Cities Covered',
    stat_user_rating: 'Average Rating',

    // CTA
    cta_title: 'Ready to Find Your Perfect Venue?',
    cta_subtitle: 'Join thousands of happy customers who found their ideal event space',
    cta_search_button: 'Start Searching',
    cta_list_venue_button: 'List Your Venue',

    // Common terms
    search: 'Search',
    filter: 'Filter',
    filters: 'Filters',
    reset: 'Reset',
    sort: 'Sort',
    sort_by: 'Sort by...',
    sort_featured: 'Sort: Featured',
    sort_price_asc: 'Sort: Price (Low to High)',
    sort_price_desc: 'Sort: Price (High to Low)',
    sort_rating: 'Sort: Highest Rated',
    sort_newest: 'Sort: Newest',
    price: 'Price',
    price_per_hour: 'Price per Hour',
    max_price_per_hour: 'Max Price per Hour',
    capacity: 'Capacity',
    min_guests: 'Min guests',
    location: 'Location',
    guests: 'guests',
    up_to: 'Up to',
    up_to_guests: 'Up to {count} guests',
    hour: 'hour',
    view: 'View',
    view_details: 'View Details',
    book_now: 'Book Now',
    contact_owner: 'Contact Owner',
    amenities: 'Amenities',
    description: 'Description',
    reviews: 'Reviews',
    availability: 'Availability',
    all_categories: 'All Categories',
    all_cities: 'All Cities',
    featured_venues: 'Featured Venues',
    featured: 'Featured',
    all_venues: 'All Venues',
    search_results: 'Search Results',
    search_venues_placeholder: 'Search venues by name, city, or keyword...',
    grid: 'Grid',
    map: 'Map',
    event_type: 'Event Type',
    city: 'City',
    apply_filters: 'Apply Filters',

    // Event categories
    wedding: 'Wedding',
    birthday: 'Birthday',
    corporate: 'Corporate',
    conference: 'Conference',
    party: 'Party',
    graduation: 'Graduation',
    anniversary: 'Anniversary',
    baby_shower: 'Baby Shower',
    engagement: 'Engagement',
    reunion: 'Reunion',

    // Status
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    completed: 'Completed',

    // Error messages
    no_venues_found: 'No venues found',
    venue_found: 'venue found',
    venues_found: 'venues found',
    try_adjusting_search: 'Try adjusting your search criteria.',
    reset_filters: 'Reset Filters',
    loading: 'Loading...',
    error_occurred: 'An error occurred',
    venue_not_found_message: 'Venue not found. It may have been removed or is no longer available.',
    venue_not_available_message: 'This venue is currently not available.',
    failed_to_load_venue_details: 'Failed to load venue details. Please try again.',
    sorry_venue_not_found_title: 'Sorry, venue not found',
    venue_not_available_title: 'Venue Not Available',
    venue_not_available_description: 'This venue is currently not available or may be under review.',

    // Booking Page
    event_details: 'Event Details',
    event_date: 'Event Date',
    pick_a_date: 'Pick a date',
    guest_count: 'Guest Count',
    start_time: 'Start Time',
    end_time: 'End Time',
    event_type_label: 'Event Type',
    other: 'Other',
    contact_information: 'Contact Information',
    full_name: 'Full Name',
    email_label: 'Email',
    phone_number: 'Phone Number',
    special_requests_label: 'Special Requests',
    special_requests_placeholder:
      'Any special requirements? (e.g., decorations, catering needs)',
    booking_summary: 'Booking Summary',
    total_amount: 'Total Amount',
    request_to_book: 'Request to Book',
    processing: 'Processing...',
    hours: 'hours',
    not_available: 'Not Available',
    error: 'Error',
    date_selection_required_title: 'Date Selection Required',
    date_selection_required_description:
      'Please select a date from the calendar first.',
    complete_payment_title: 'Complete Your Payment',
    secure_payment_by_stripe: 'Secure payment powered by Stripe',
    time: 'Time',
    secure_payment: 'Secure Payment',
    secure_payment_desc:
      "Your payment information is protected with industry-standard encryption. We never store your credit card details on our servers.",

    // Currency names
    usd_currency: 'US Dollar',
    eur_currency: 'Euro',
    gbp_currency: 'British Pound',
    sar_currency: 'Saudi Riyal',
    aed_currency: 'UAE Dirham',
    cad_currency: 'Canadian Dollar',
    aud_currency: 'Australian Dollar',

    // User actions
    log_in: 'Log In',
    sign_up: 'Sign Up',
    log_out: 'Log Out',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    report: 'Report',
    share: 'Share',
    go_back: 'Go Back',
    browse_other_venues: 'Browse Other Venues',

    // Venue Details Page
    about_this_venue: 'About This Venue',
    what_this_place_offers: 'What This Place Offers',
    check_availability: 'Check Availability',
    maximum_capacity_label: 'Maximum Capacity',
    location_label: 'Location',
    guests_label: 'Guests',
    based_on_reviews: 'Based on {count} reviews',
    no_reviews_yet_be_first: 'No reviews yet. Be the first to review this venue!',
    star: 'star',
    stars: 'stars',

    // Review System
    write_review_button: 'Write Review',
    review_submitted_label: 'Review Submitted',

    // Venue Actions
    view_venue: 'View Venue',
    pay_now_button: 'Pay Now',
    change_date_time_button: 'Change Date/Time',
    cancel_booking_button: 'Cancel Booking',
    awaiting_confirmation: 'Awaiting Confirmation',
    report_venue: 'Report Venue',
    report_issue: 'Report Issue',

    // My Bookings Page
    manage_venues_bookings: 'Manage your venue bookings and reservations',
    refreshing: 'Refreshing',
    refresh: 'Refresh',
    logged_in_as: 'Logged in as',
    found_bookings_count: 'Found {count} bookings',
    no_bookings_yet: 'No bookings yet',
    start_browsing_venues: 'Start browsing venues to make your first booking',
    recently_made_booking_refresh_hint:
      'If you recently made a booking, try refreshing the page',
    loading_venue_details: 'Loading venue details...',
    tbd: 'TBD',
    booking_id_label: 'Booking ID',
    created_label: 'Created',
    change_label: 'Change',
    cancellation_label: 'Cancellation',
    change_request_pending: 'Change Request Pending',
    requested_new_date_label: 'Requested New Date',
    requested_new_time_label: 'Requested New Time',
    waiting_for_owner_approval: 'Waiting for venue owner approval',
    change_approved_message: 'Your change request has been approved',
    change_rejected_message: 'Your change request was rejected',
    cancellation_requested: 'Cancellation Requested',
    refund_amount_label: 'Refund Amount',
    cancellation_approved_message:
      'Your cancellation has been approved. Refund of',
    is_being_processed_message: 'is being processed',
    cancellation_rejected_message:
      'Your cancellation request was rejected by the venue owner',
    total_amount_label: 'Total Amount',
    contact_label: 'Contact',
    rejected: 'Rejected',
    payment_failed: 'Payment Failed',
    awaiting_payment: 'Awaiting Payment',
    payment_pending: 'Payment Pending',
    cancelled_pending_refund: 'Cancelled - Pending Refund',
    approved: 'Approved',
    bookings_loaded_success_title: 'Bookings Loaded',
    bookings_loaded_success_description:
      'Successfully loaded {count} bookings',
    no_bookings_found_title: 'No Bookings Found',
    no_bookings_found_description: "You don't have any bookings yet",
    failed_to_load_bookings_title: 'Failed to Load',
    failed_to_load_bookings_description:
      'Could not load your bookings. Please try again.',
    please_log_in: 'Please Log In',
    please_log_in_message: 'You need to be logged in to view your bookings',
    location_not_specified: 'Location not specified',
    venue_details_unavailable: 'Venue details unavailable',

    // Owner Dashboard Texts
    my_venues_login_required: 'You must be logged in to view your venues.',
    my_venues_title: 'My Venues',
    my_venues_subtitle: 'Manage your venue listings and bookings.',
    add_new_venue: 'Add New Venue',
    my_venues_listed_venues_title: 'Your Listed Venues',
    my_venues_listed_venues_subtitle:
      'Here are all the venues you have listed on Party2Go.',
    my_venues_no_venues_listed: "You haven't listed any venues yet.",
    bookings_dashboard_title: 'Bookings Dashboard',
    bookings_dashboard_subtitle: 'Manage all bookings for your venues.',
    upcoming: 'Upcoming',
    past: 'Past',
    no_bookings_in_category: 'No bookings in this category.',
    approve: 'Approve',
    reject: 'Reject',
    booking_updated_toast_title: 'Booking Updated',
    booking_updated_toast_desc:
      'The booking for {contact_name} has been {status}.',
    booking_update_failed_toast_desc: 'Failed to update booking status.',

    // VenueCalendar Component
    availability_calendar: 'Availability Calendar',
    block_date: 'Block Date',
    legend_available: 'Available',
    legend_booked: 'Booked',
    legend_blocked: 'Blocked',
    selected_date: 'Selected Date',
    unblock: 'Unblock',
    block_date_title: 'Block Date',
    reason: 'Reason',
    maintenance: 'Maintenance',
    private_event: 'Private Event',
    holiday: 'Holiday',
    owner_unavailable: 'Owner Unavailable',
    notes_optional: 'Notes (Optional)',
    block_entire_day: 'Block entire day',
    failed_to_load_calendar: 'Failed to load calendar data',
    date_blocked_success: 'Date blocked successfully',
    date_unblocked_success: 'Date unblocked successfully',
    failed_to_block_date: 'Failed to block date',
    failed_to_unblock_date: 'Failed to unblock date',

    // Phase 4 additions (only unique keys kept)
    advanced_search: 'Advanced Search',
    trending_this_week: 'Trending This Week',
    recommended_for_you: 'Recommended for You',
    recently_viewed: 'Recently Viewed',
    popular_venues: 'Popular Venues',
    discover_venues: 'Discover Venues',
    home: 'Home',
    bookings: 'Bookings',
    notifications: 'Notifications',
    for_you: 'For You',
    trending: 'Trending',
    recent: 'Recent',
    instant_book: 'Instant Book',
    search_radius: 'Search Radius',
    any_event_type: 'Any Event Type',
    any_rating: 'Any Rating',
    any_type: 'Any Type',
    indoor_only: 'Indoor Only',
    outdoor_only: 'Outdoor Only',
    indoor_outdoor: 'Indoor & Outdoor',
    show_only_available: 'Show only available venues',
    featured_venues_only: 'Featured venues only',
    venues_only: 'only',
    search_venues: 'Search Venues',
    clear: 'Clear',
    basic_search: 'Basic Search',
    advanced: 'Advanced',
    location_date: 'Location & Date',
    search_keywords: 'Search Keywords',
    venue_name_description: 'Venue name, description, or keywords...',
    city_or_area: 'City or area...',
    all_event_types: 'All Event Types',
    min_guests: 'Min Guests',
    max_guests: 'Max Guests',
    price_range_per_hour: 'Price Range (per hour)',
    minimum_rating: 'Minimum Rating',
    venue_type: 'Venue Type',
    all_types: 'All Types',
    search_radius_km: 'Search Radius: {distance} km',
    applied_filters: 'Applied Filters:',
    clear_all: 'Clear all',
    sign_in: 'Sign In',
    my_profile: 'My Profile',
    my_venues_dashboard: 'My Venues Dashboard'
  },

  ar: {
    // Navigation
    browse_venues: 'تصفح الأماكن',
    map_view: 'عرض الخريطة',
    add_venue: 'إضافة مكان',
    my_bookings: 'حجوزاتي',
    my_venues: 'أماكني',
    my_favorites: 'المفضلة',
    messages: 'الرسائل',
    profile: 'الملف الشخصي',
    vendor_marketplace: 'سوق الموردين',
    join_as_vendor: 'انضم كمورد',

    // Home page
    welcome: 'اعثر على مكان الحدث المثالي',
    hero_subtitle: 'اكتشف واحجز أماكن رائعة لمناسباتك الخاصة',
    features_title: 'لماذا تختار Party2Book؟',
    features_subtitle: 'كل ما تحتاجه لتجربة حجز مثالية',
    feature_easy_discovery_title: 'اكتشاف سهل',
    feature_easy_discovery_desc:
      'اعثر على المكان المثالي باستخدام البحث والفلاتر القوية',
    feature_secure_booking_title: 'حجز آمن',
    feature_secure_booking_desc: 'مدفوعات آمنة وحجوزات مضمونة',
    feature_support_title: 'دعم على مدار الساعة',
    feature_support_desc: 'احصل على المساعدة متى احتجتها من فريقنا المتخصص',

    // Statistics
    stat_premium_venues: 'أماكن مميزة',
    stat_successful_bookings: 'حجوزات ناجحة',
    stat_cities: 'مدن مغطاة',
    stat_user_rating: 'متوسط التقييم',

    // CTA
    cta_title: 'جاهز للعثور على مكانك المثالي؟',
    cta_subtitle:
      'انضم لآلاف العملاء السعداء الذين وجدوا مساحة الحدث المثالية',
    cta_search_button: 'ابدأ البحث',
    cta_list_venue_button: 'أدرج مكانك',

    // Common terms
    search: 'بحث',
    filter: 'فلتر',
    filters: 'الفلاتر',
    reset: 'إعادة تعيين',
    sort: 'ترتيب',
    sort_by: 'ترتيب حسب...',
    sort_featured: 'ترتيب: مميز',
    sort_price_asc: 'ترتيب: السعر (من الأقل للأعلى)',
    sort_price_desc: 'ترتيب: السعر (من الأعلى للأقل)',
    sort_rating: 'ترتيب: الأعلى تقييماً',
    sort_newest: 'ترتيب: الأحدث',
    price: 'السعر',
    price_per_hour: 'السعر في الساعة',
    max_price_per_hour: 'أقصى سعر للساعة',
    capacity: 'السعة',
    min_guests: 'أقل عدد للضيوف',
    location: 'الموقع',
    guests: 'ضيف',
    up_to: 'حتى',
    up_to_guests: 'حتى {count} ضيف',
    hour: 'ساعة',
    view: 'عرض',
    view_details: 'عرض التفاصيل',
    book_now: 'احجز الآن',
    contact_owner: 'اتصل بالمالك',
    amenities: 'المرافق',
    description: 'الوصف',
    reviews: 'التقييمات',
    availability: 'التوفر',
    all_categories: 'جميع الفئات',
    all_cities: 'جميع المدن',
    featured_venues: 'الأماكن المميزة',
    featured: 'مميز',
    all_venues: 'جميع الأماكن',
    search_results: 'نتائج البحث',
    search_venues_placeholder:
      'ابحث عن الأماكن بالاسم، المدينة، أو الكلمات المفتاحية...',
    grid: 'شبكة',
    map: 'خريطة',
    event_type: 'نوع الحدث',
    city: 'المدينة',
    apply_filters: 'تطبيق الفلاتر',

    // Event categories
    wedding: 'زفاف',
    birthday: 'عيد ميلاد',
    corporate: 'شركات',
    conference: 'مؤتمر',
    party: 'حفلة',
    graduation: 'تخرج',
    anniversary: 'ذكرى سنوية',
    baby_shower: 'استقبال مولود',
    engagement: 'خطوبة',
    reunion: 'لم شمل',

    // Status
    confirmed: 'مؤكد',
    pending: 'في الانتظار',
    cancelled: 'ملغي',
    completed: 'مكتمل',

    // Error messages
    no_venues_found: 'لم يتم العثور على أماكن',
    venue_found: 'مكان موجود',
    venues_found: 'أماكن موجودة',
    try_adjusting_search: 'جرّب تعديل معايير البحث.',
    reset_filters: 'إعادة تعيين الفلاتر',
    loading: 'جاري التحميل...',
    error_occurred: 'حدث خطأ',
    venue_not_found_message:
      'المكان غير موجود. ربما تم حذفه أو لم يعد متاحًا.',
    venue_not_available_message: 'هذا المكان غير متاح حاليًا.',
    failed_to_load_venue_details: 'فشل تحميل تفاصيل المكان. يرجى المحاولة مرة أخرى.',
    sorry_venue_not_found_title: 'عذراً، المكان غير موجود',
    venue_not_available_title: 'المكان غير متوفر',
    venue_not_available_description:
      'هذا المكان غير متوفر حاليًا أو قد يكون قيد المراجعة.',

    // Booking Page
    event_details: 'تفاصيل الحدث',
    event_date: 'تاريخ الحدث',
    pick_a_date: 'اختر تاريخًا',
    guest_count: 'عدد الضيوف',
    start_time: 'وقت البدء',
    end_time: 'وقت الانتهاء',
    event_type_label: 'نوع المناسبة',
    other: 'أخرى',
    contact_information: 'معلومات الاتصال',
    full_name: 'الاسم الكامل',
    email_label: 'البريد الإلكتروني',
    phone_number: 'رقم الهاتف',
    special_requests_label: 'طلبات خاصة',
    special_requests_placeholder:
      'هل لديك أي متطلبات خاصة؟ (مثال: زينة، احتياجات تموين)',
    booking_summary: 'ملخص الحجز',
    total_amount: 'المبلغ الإجمالي',
    request_to_book: 'طلب حجز',
    processing: 'جاري المعالجة...',
    hours: 'ساعات',
    not_available: 'غير متاح',
    error: 'خطأ',
    date_selection_required_title: 'يرجى اختيار تاريخ',
    date_selection_required_description:
      'يرجى اختيار تاريخ من التقويم أولاً.',
    complete_payment_title: 'أكمل عملية الدفع',
    secure_payment_by_stripe: 'دفع آمن بواسطة Stripe',
    time: 'الوقت',
    secure_payment: 'دفع آمن',
    secure_payment_desc:
      'معلومات الدفع الخاصة بك محمية بتشفير متوافق مع معايير الصناعة. نحن لا نقوم بتخزين تفاصيل بطاقتك الائتمانية على خوادمنا أبدًا.',

    // Currency names
    usd_currency: 'دولار أمريكي',
    eur_currency: 'يورو',
    gbp_currency: 'جنيه إسترليني',
    sar_currency: 'ريال سعودي',
    aed_currency: 'درهم إماراتي',
    cad_currency: 'دولار كندي',
    aud_currency: 'دولار أسترالي',

    // User actions
    log_in: 'تسجيل الدخول',
    sign_up: 'إنشاء حساب',
    log_out: 'تسجيل الخروج',
    save: 'حفظ',
    cancel: 'إلغاء',
    submit: 'إرسال',
    delete: 'حذف',
    edit: 'تعديل',
    report: 'إبلاغ',
    share: 'مشاركة',
    go_back: 'العودة',
    browse_other_venues: 'تصفح أماكن أخرى',

    // Venue Details Page
    about_this_venue: 'عن هذا المكان',
    what_this_place_offers: 'ماذا يقدم هذا المكان',
    check_availability: 'تحقق من التوفر',
    maximum_capacity_label: 'السعة القصوى',
    location_label: 'الموقع',
    guests_label: 'ضيوف',
    based_on_reviews: 'بناءً على {count} تقييم',
    no_reviews_yet_be_first: 'لا توجد تقييمات بعد. كن أول من يقيم هذا المكان!',
    star: 'نجمة',
    stars: 'نجوم',

    // Review System
    write_review_button: 'كتابة تقييم',
    review_submitted_label: 'تم إرسال التقييم',

    // Venue Actions
    view_venue: 'عرض المكان',
    pay_now_button: 'ادفع الآن',
    change_date_time_button: 'تغيير التاريخ/الوقت',
    cancel_booking_button: 'إلغاء الحجز',
    awaiting_confirmation: 'في انتظار التأكيد',
    report_venue: 'الإبلاغ عن المكان',
    report_issue: 'الإبلاغ عن مشكلة',

    // My Bookings Page
    manage_venues_bookings: 'إدارة حجوزات الأماكن والمواعيد',
    refreshing: 'جاري التحديث',
    refresh: 'تحديث',
    logged_in_as: 'مسجل الدخول باسم',
    found_bookings_count: 'تم العثور على {count} حجوزات',
    no_bookings_yet: 'لا توجد حجوزات بعد',
    start_browsing_venues: 'ابدأ بتصفح الأماكن لإجراء أول حجز',
    recently_made_booking_refresh_hint:
      'إذا قمت بحجز مؤخراً، جرب تحديث الصفحة',
    loading_venue_details: 'جاري تحميل تفاصيل المكان...',
    tbd: 'سيتم تحديدها',
    booking_id_label: 'رقم الحجز',
    created_label: 'تم الإنشاء',
    change_label: 'تغيير',
    cancellation_label: 'إلغاء',
    change_request_pending: 'طلب التغيير معلق',
    requested_new_date_label: 'التاريخ الجديد المطلوب',
    requested_new_time_label: 'الوقت الجديد المطلوب',
    waiting_for_owner_approval: 'في انتظار موافقة مالك المكان',
    change_approved_message: 'تم قبول طلب التغيير',
    change_rejected_message: 'تم رفض طلب التغيير',
    cancellation_requested: 'طلب الإلغاء',
    refund_amount_label: 'مبلغ الاسترداد',
    cancellation_approved_message: 'تم قبول طلب الإلغاء. استرداد',
    is_being_processed_message: 'قيد المعالجة',
    cancellation_rejected_message:
      'تم رفض طلب الإلغاء من قبل مالك المكان',
    total_amount_label: 'المبلغ الإجمالي',
    contact_label: 'جهة الاتصال',
    rejected: 'مرفوض',
    payment_failed: 'فشل الدفع',
    awaiting_payment: 'في انتظار الدفع',
    payment_pending: 'الدفع معلق',
    cancelled_pending_refund: 'ملغي - الاسترداد معلق',
    approved: 'موافق عليه',
    bookings_loaded_success_title: 'تم تحميل الحجوزات',
    bookings_loaded_success_description: 'تم تحميل {count} حجوزات بنجاح',
    no_bookings_found_title: 'لم يتم العثور على حجوزات',
    no_bookings_found_description: 'ليس لديك أي حجوزات بعد',
    failed_to_load_bookings_title: 'فشل في التحميل',
    failed_to_load_bookings_description:
      'لا يمكن تحميل حجوزاتك. يرجى المحاولة مرة أخرى.',
    please_log_in: 'يرجى تسجيل الدخول',
    please_log_in_message: 'تحتاج إلى تسجيل الدخول لعرض حجوزاتك',
    location_not_specified: 'الموقع غير محدد',
    venue_details_unavailable: 'تفاصيل المكان غير متوفرة',

    // Owner Dashboard Texts
    my_venues_login_required: 'يجب عليك تسجيل الدخول لعرض أماكنك.',
    my_venues_title: 'أماكني',
    my_venues_subtitle: 'إدارة قوائم أماكنك وحجوزاتك.',
    add_new_venue: 'إضافة مكان جديد',
    my_venues_listed_venues_title: 'الأماكن المدرجة الخاصة بك',
    my_venues_listed_venues_subtitle:
      'هنا جميع الأماكن التي أدرجتها في Party2Go.',
    my_venues_no_venues_listed: 'لم تقم بإدراج أي أماكن بعد.',
    bookings_dashboard_title: 'لوحة تحكم الحجوزات',
    bookings_dashboard_subtitle: 'إدارة جميع حجوزات أماكنك.',
    upcoming: 'القادمة',
    past: 'السابقة',
    no_bookings_in_category: 'لا توجد حجوزات في هذه الفئة.',
    approve: 'موافقة',
    reject: 'رفض',
    booking_updated_toast_title: 'تم تحديث الحجز',
    booking_updated_toast_desc: 'تم {status} الحجز لـ {contact_name}.',
    booking_update_failed_toast_desc: 'فشل تحديث حالة الحجز.',

    // VenueCalendar Component
    availability_calendar: 'تقويم التوفر',
    block_date: 'حظر تاريخ',
    legend_available: 'متاح',
    legend_booked: 'محجوز',
    legend_blocked: 'محظور',
    selected_date: 'التاريخ المحدد',
    unblock: 'إلغاء الحظر',
    block_date_title: 'حظر تاريخ',
    reason: 'السبب',
    maintenance: 'صيانة',
    private_event: 'حدث خاص',
    holiday: 'عطلة',
    owner_unavailable: 'المالك غير متاح',
    notes_optional: 'ملاحظات (اختياري)',
    block_entire_day: 'حظر اليوم بأكمله',
    failed_to_load_calendar: 'فشل تحميل بيانات التقويم',
    date_blocked_success: 'تم حظر التاريخ بنجاح',
    date_unblocked_success: 'تم إلغاء حظر التاريخ بنجاح',
    failed_to_block_date: 'فشل حظر التاريخ',
    failed_to_unblock_date: 'فشل إلغاء حظر التاريخ',

    // Phase 4 Arabic additions (only unique keys kept)
    advanced_search: 'البحث المتقدم',
    trending_this_week: 'الأكثر رواجاً هذا الأسبوع',
    recommended_for_you: 'موصى لك',
    recently_viewed: 'تم عرضها مؤخراً',
    popular_venues: 'الأماكن الشائعة',
    discover_venues: 'اكتشف الأماكن',
    home: 'الرئيسية',
    bookings: 'الحجوزات',
    notifications: 'الإشعارات',
    for_you: 'لك',
    trending: 'رائج',
    recent: 'حديث',
    instant_book: 'حجز فوري',
    search_radius: 'نطاق البحث',
    any_event_type: 'أي نوع من الأحداث',
    any_rating: 'أي تقييم',
    any_type: 'أي نوع',
    indoor_only: 'داخلي فقط',
    outdoor_only: 'خارجي فقط',
    indoor_outdoor: 'داخلي وخارجي',
    show_only_available: 'إظهار الأماكن المتاحة فقط',
    featured_venues_only: 'الأماكن المميزة فقط',
    venues_only: 'فقط',
    search_venues: 'البحث عن الأماكن',
    clear: 'مسح',
    basic_search: 'البحث الأساسي',
    advanced: 'متقدم',
    location_date: 'الموقع والتاريخ',
    search_keywords: 'كلمات البحث',
    venue_name_description: 'اسم المكان، الوصف، أو الكلمات المفتاحية...',
    city_or_area: 'المدينة أو المنطقة...',
    all_event_types: 'جميع أنواع الأحداث',
    min_guests: 'أقل عدد ضيوف',
    max_guests: 'أكبر عدد ضيوف',
    price_range_per_hour: 'نطاق السعر (للساعة)',
    minimum_rating: 'أقل تقييم',
    venue_type: 'نوع المكان',
    all_types: 'جميع الأنواع',
    search_radius_km: 'نطاق البحث: {distance} كم',
    applied_filters: 'المرشحات المطبقة:',
    clear_all: 'مسح الكل',
    sign_in: 'تسجيل الدخول',
    my_profile: 'ملفي الشخصي',
    my_venues_dashboard: 'لوحة إدارة أماكني'
  }
};

// Get localized text with fallback to English and variable replacement
export const getLocalizedText = (key, language = 'en', variables = {}) => {
  const langDict = translations[language] || translations.en;
  let text = langDict[key] || translations.en[key] || key;

  // Replace placeholders like {count}
  Object.keys(variables).forEach((varKey) => {
    const regex = new RegExp(`{${varKey}}`, 'g');
    text = text.replace(regex, variables[varKey]);
  });

  return text;
};

// Enhanced currency conversion rates with more currencies
const exchangeRates = {
  USD: 1,
  EUR: 0.85,
  SAR: 3.75,
  AED: 3.67,
  GBP: 0.73,
  CAD: 1.25,
  AUD: 1.35
};

// Convert currency amounts
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (
    amount === null ||
    amount === undefined ||
    isNaN(amount) ||
    fromCurrency === toCurrency
  )
    return amount;

  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];

  if (!fromRate || !toRate) {
    console.warn(
      `Currency conversion: Missing exchange rate for ${
        !fromRate ? fromCurrency : toCurrency
      }`
    );
    return amount; // Or throw an error, depending on desired behavior
  }

  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

// Enhanced currency formatting with proper symbols and localization
export const formatCurrency = (amount, currency = 'USD', language = 'en') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    SAR: 'ر.س',
    AED: 'د.إ',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$'
  };

  const symbol = currencySymbols[currency] || currency;

  // Enhanced number formatting with proper locale
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  const formattedAmount = parseFloat(amount).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  });

  // For Arabic and RTL currencies, put currency after the amount
  if (language === 'ar' || ['SAR', 'AED'].includes(currency)) {
    return `${formattedAmount} ${symbol}`;
  }

  // For most currencies, put symbol before amount
  return `${symbol}${formattedAmount}`;
};

// Format numbers with proper localization
export const formatNumber = (number, language = 'en') => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return parseFloat(number).toLocaleString(locale);
};

// Format dates with localization
export const formatDate = (date, language = 'en', format = 'medium') => {
  if (!date) return '';

  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if dateObj is a valid date
  if (isNaN(dateObj.getTime())) {
    console.warn(`Invalid date provided to formatDate: ${date}`);
    return '';
  }

  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  };

  return dateObj.toLocaleDateString(locale, options[format] || options.medium);
};

// Format time with localization
export const formatTime = (time, language = 'en') => {
  if (!time) return '';

  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  let timeObj;

  if (typeof time === 'string') {
    try {
      timeObj = new Date(`2000-01-01T${time}`);
    } catch (e) {
      console.warn(`Invalid time string provided to formatTime: ${time}`, e);
      return '';
    }
  } else if (time instanceof Date) {
    timeObj = time;
  } else {
    console.warn(`Unsupported time type provided to formatTime: ${typeof time}`);
    return '';
  }

  if (isNaN(timeObj.getTime())) {
    console.warn(`Could not parse time to a valid Date object: ${time}`);
    return '';
  }

  return timeObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language === 'en'
  });
};

// Get currency suggestion based on country code
export const getCurrencyForCountry = (countryCode) => {
  const countryCurrencyMap = {
    US: 'USD',
    SA: 'SAR',
    AE: 'AED',
    GB: 'GBP',
    CA: 'CAD',
    AU: 'AUD',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    PT: 'EUR',
    FI: 'EUR',
    IE: 'EUR'
  };

  return countryCurrencyMap[countryCode.toUpperCase()] || 'USD';
};

// Get language suggestion based on country code
export const getLanguageForCountry = (countryCode) => {
  const countryLanguageMap = {
    SA: 'ar',
    AE: 'ar',
    QA: 'ar',
    KW: 'ar',
    BH: 'ar',
    OM: 'ar',
    JO: 'ar',
    LB: 'ar',
    SY: 'ar',
    IQ: 'ar',
    EG: 'ar',
    LY: 'ar',
    TN: 'ar',
    DZ: 'ar',
    MA: 'ar'
  };

  return countryLanguageMap[countryCode.toUpperCase()] || 'en';
};

// New utility for calculating venue prices considering dynamic rules and discounts
export const calculateVenuePrice = async (
  venue,
  pricingRules,
  date,
  startTime,
  endTime,
  discountCode
) => {
  // NOTE: explicit .js for ESM on Linux/Vercel
  const { VenuePricing } = await import('@/api/entities/index.js');
  const { DiscountCode } = await import('@/api/entities/index.js');
  const { isSameDay, parse, getDay } = await import('date-fns');

  const basePricePerHour = venue.price_per_hour;
  let finalPrice = 0;
  const details = {
    hours: 0,
    baseTotal: 0,
    dynamicAdjustment: 0,
    appliedRule: null,
    subtotal: 0,
    discountAmount: 0,
    discountMessage: ''
  };

  // 1. Calculate hours
  try {
    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());
    details.hours = (end - start) / (1000 * 60 * 60);
    if (details.hours < 0) details.hours = 0;
  } catch {
    details.hours = 0;
  }

  details.baseTotal = basePricePerHour * details.hours;
  let adjustedPricePerHour = basePricePerHour;

  // 2. Apply dynamic pricing rule
  if (date) {
    const eventDate = new Date(date);
    const dayOfWeek = getDay(eventDate); // 0 = Sunday, 6 = Saturday

    const applicableRule = pricingRules.find((rule) => {
      const ruleAppliesToDay =
        !rule.days_of_week ||
        rule.days_of_week.length === 0 ||
        rule.days_of_week.includes(dayOfWeek);
      const ruleAppliesToDate =
        (!rule.start_date || eventDate >= new Date(rule.start_date)) &&
        (!rule.end_date || eventDate <= new Date(rule.end_date));
      return rule.is_active && ruleAppliesToDay && ruleAppliesToDate;
    });

    if (applicableRule) {
      details.appliedRule = applicableRule;
      if (applicableRule.price_modifier_type === 'percentage') {
        adjustedPricePerHour *= 1 + applicableRule.price_modifier_value / 100;
      } else {
        // fixed_amount
        adjustedPricePerHour += applicableRule.price_modifier_value;
      }
    }
  }

  details.dynamicAdjustment =
    adjustedPricePerHour * details.hours - details.baseTotal;
  details.subtotal = adjustedPricePerHour * details.hours;

  // 3. Apply discount code
  if (discountCode) {
    try {
      const codes = await DiscountCode.filter({
        code: discountCode,
        venue_id: venue.id,
        is_active: true
      });
      const validCode = codes[0];

      if (validCode) {
        if (validCode.expires_at && new Date(validCode.expires_at) < new Date()) {
          details.discountMessage = 'This discount code has expired.';
        } else {
          if (validCode.discount_type === 'percentage') {
            details.discountAmount = details.subtotal * (validCode.value / 100);
          } else {
            // fixed_amount
            details.discountAmount = validCode.value;
          }
          details.discountMessage = `Discount of ${formatCurrency(
            details.discountAmount,
            venue.currency
          )} applied.`;
        }
      } else {
        details.discountMessage = 'Invalid discount code.';
      }
    } catch (err) {
      console.error('Error validating discount code:', err);
      details.discountMessage = 'Could not validate code.';
    }
  }

  finalPrice = Math.max(0, details.subtotal - details.discountAmount);

  return { price: finalPrice, details };
};
