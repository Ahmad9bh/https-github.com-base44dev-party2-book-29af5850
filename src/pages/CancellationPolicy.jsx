import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/components/common/LocalizationContext';
import { Clock, DollarSign, Shield, AlertTriangle } from 'lucide-react';

export default function CancellationPolicy() {
  const { currentLanguage } = useLocalization();

  React.useEffect(() => {
    document.title = `Cancellation Policy | Party2Book`;
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentLanguage === 'ar' ? 'سياسة الإلغاء' : 'Cancellation Policy'}
        </h1>
        <p className="text-gray-600">
          {currentLanguage === 'ar' 
            ? 'آخر تحديث: ديسمبر 2024'
            : 'Last updated: December 2024'
          }
        </p>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
          <div>
            <p className="text-amber-800 font-medium mb-2">
              {currentLanguage === 'ar' ? 'تنبيه مهم' : 'Important Notice'}
            </p>
            <p className="text-amber-700">
              {currentLanguage === 'ar' 
                ? 'تختلف سياسات الإلغاء باختلاف الأماكن. يرجى مراجعة سياسة الإلغاء الخاصة بكل مكان قبل إتمام الحجز.'
                : 'Cancellation policies vary by venue. Please review each venue\'s specific cancellation policy before completing your booking.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {currentLanguage === 'ar' ? 'الجدول الزمني للإلغاء' : 'Cancellation Timeline'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Flexible Cancellation */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-green-700">
                  {currentLanguage === 'ar' ? 'الإلغاء المرن' : 'Flexible Cancellation'}
                </h3>
                <Badge className="bg-green-100 text-green-800">
                  {currentLanguage === 'ar' ? 'الأكثر شيوعاً' : 'Most Common'}
                </Badge>
              </div>
              {currentLanguage === 'ar' ? (
                <div className="text-right" dir="rtl">
                  <ul className="space-y-2 text-sm">
                    <li><strong>48+ ساعة قبل الحدث:</strong> استرداد كامل (100%)</li>
                    <li><strong>24-48 ساعة قبل الحدث:</strong> استرداد جزئي (50%)</li>
                    <li><strong>أقل من 24 ساعة:</strong> لا يوجد استرداد</li>
                  </ul>
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li><strong>48+ hours before event:</strong> Full refund (100%)</li>
                  <li><strong>24-48 hours before event:</strong> Partial refund (50%)</li>
                  <li><strong>Less than 24 hours:</strong> No refund</li>
                </ul>
              )}
            </div>

            {/* Moderate Cancellation */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-yellow-700">
                  {currentLanguage === 'ar' ? 'الإلغاء المعتدل' : 'Moderate Cancellation'}
                </h3>
              </div>
              {currentLanguage === 'ar' ? (
                <div className="text-right" dir="rtl">
                  <ul className="space-y-2 text-sm">
                    <li><strong>7+ أيام قبل الحدث:</strong> استرداد كامل (100%)</li>
                    <li><strong>3-7 أيام قبل الحدث:</strong> استرداد جزئي (50%)</li>
                    <li><strong>أقل من 3 أيام:</strong> لا يوجد استرداد</li>
                  </ul>
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li><strong>7+ days before event:</strong> Full refund (100%)</li>
                  <li><strong>3-7 days before event:</strong> Partial refund (50%)</li>
                  <li><strong>Less than 3 days:</strong> No refund</li>
                </ul>
              )}
            </div>

            {/* Strict Cancellation */}
            <div className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-red-700">
                  {currentLanguage === 'ar' ? 'الإلغاء الصارم' : 'Strict Cancellation'}
                </h3>
                <Badge variant="destructive">
                  {currentLanguage === 'ar' ? 'للأماكن المميزة' : 'Premium Venues'}
                </Badge>
              </div>
              {currentLanguage === 'ar' ? (
                <div className="text-right" dir="rtl">
                  <ul className="space-y-2 text-sm">
                    <li><strong>14+ يوم قبل الحدث:</strong> استرداد جزئي (50%)</li>
                    <li><strong>أقل من 14 يوم:</strong> لا يوجد استرداد</li>
                  </ul>
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li><strong>14+ days before event:</strong> Partial refund (50%)</li>
                  <li><strong>Less than 14 days:</strong> No refund</li>
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {currentLanguage === 'ar' ? 'رسوم المعالجة' : 'Processing Fees'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>رسوم خدمة Party2Book غير قابلة للاسترداد في جميع الحالات، بما في ذلك:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>رسوم معالجة الدفع (3-5% من قيمة الحجز)</li>
                  <li>رسوم الخدمة الأساسية</li>
                  <li>رسوم العمليات الإدارية</li>
                </ul>
                <p className="text-sm text-gray-600">يتم خصم هذه الرسوم من إجمالي مبلغ الاسترداد.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>Party2Book service fees are non-refundable in all cases, including:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Payment processing fees (3-5% of booking value)</li>
                  <li>Platform service fees</li>
                  <li>Administrative processing fees</li>
                </ul>
                <p className="text-sm text-gray-600">These fees are deducted from the total refund amount.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? 'إجراءات الإلغاء' : 'Cancellation Process'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>لإلغاء حجزك:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>قم بتسجيل الدخول إلى حسابك</li>
                  <li>انتقل إلى صفحة "حجوزاتي"</li>
                  <li>اختر الحجز المراد إلغاؤه</li>
                  <li>انقر على "طلب الإلغاء"</li>
                  <li>أدخل سبب الإلغاء</li>
                  <li>أرسل الطلب للمراجعة</li>
                </ol>
                <p><strong>مهم:</strong> طلبات الإلغاء تخضع لموافقة صاحب المكان والإدارة.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>To cancel your booking:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Log into your account</li>
                  <li>Go to "My Bookings" page</li>
                  <li>Select the booking you want to cancel</li>
                  <li>Click "Request Cancellation"</li>
                  <li>Provide a reason for cancellation</li>
                  <li>Submit request for review</li>
                </ol>
                <p><strong>Important:</strong> Cancellation requests are subject to venue owner and admin approval.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? 'الظروف الاستثنائية' : 'Extenuating Circumstances'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>قد نوافق على الاسترداد الكامل في الحالات التالية:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>الطوارئ الطبية (بوثائق طبية)</li>
                  <li>الكوارث الطبيعية</li>
                  <li>القيود الحكومية الطارئة</li>
                  <li>إغلاق المكان بسبب ظروف خارجة عن السيطرة</li>
                </ul>
                <p>يتطلب الأمر تقديم الوثائق المناسبة ومراجعة كل حالة على حدة.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>We may approve full refunds in the following cases:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Medical emergencies (with medical documentation)</li>
                  <li>Natural disasters</li>
                  <li>Government emergency restrictions</li>
                  <li>Venue closure due to circumstances beyond control</li>
                </ul>
                <p>Requires appropriate documentation and case-by-case review.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {currentLanguage === 'ar' ? 'حل النزاعات' : 'Dispute Resolution'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>إذا لم توافق على قرار الإلغاء:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>تواصل مع خدمة العملاء خلال 48 ساعة</li>
                  <li>قدم الأدلة والوثائق الداعمة</li>
                  <li>ستتم مراجعة حالتك من قبل فريق متخصص</li>
                  <li>ستحصل على رد نهائي خلال 3-5 أيام عمل</li>
                </ol>
                <p>قرارات فريق حل النزاعات نهائية وملزمة.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>If you disagree with a cancellation decision:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Contact customer service within 48 hours</li>
                  <li>Provide supporting evidence and documentation</li>
                  <li>Your case will be reviewed by our specialist team</li>
                  <li>You will receive a final response within 3-5 business days</li>
                </ol>
                <p>Dispute resolution team decisions are final and binding.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? 'التواصل معنا' : 'Contact Us'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>لأي استفسارات حول سياسة الإلغاء:</p>
                <ul className="list-none space-y-2">
                  <li>البريد الإلكتروني: support@party2book.com</li>
                  <li>الهاتف: +971-4-XXX-XXXX</li>
                  <li>الدردشة المباشرة: متاحة 24/7</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <p>For questions about our cancellation policy:</p>
                <ul className="list-none space-y-2">
                  <li>Email: support@party2book.com</li>
                  <li>Phone: +971-4-XXX-XXXX</li>
                  <li>Live Chat: Available 24/7</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}