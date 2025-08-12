import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/components/common/LocalizationContext';

export default function CookiePolicy() {
  const { currentLanguage } = useLocalization();

  React.useEffect(() => {
    document.title = `Cookie Policy | Party2Book`;
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentLanguage === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
        </h1>
        <p className="text-gray-600">
          {currentLanguage === 'ar' 
            ? 'آخر تحديث: ديسمبر 2024'
            : 'Last updated: December 2024'
          }
        </p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg mb-8">
        <p className="text-yellow-800">
          {currentLanguage === 'ar' 
            ? 'نستخدم ملفات تعريف الارتباط (الكوكيز) لتحسين تجربتك على منصة Party2Book. توضح هذه السياسة أنواع الكوكيز المستخدمة وكيفية إدارتها.'
            : 'We use cookies to enhance your experience on Party2Book. This policy explains the types of cookies we use and how you can manage them.'
          }
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? '1. ما هي ملفات تعريف الارتباط؟' : '1. What Are Cookies?'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>ملفات تعريف الارتباط (الكوكيز) هي ملفات نصية صغيرة يتم حفظها على جهازك عند زيارة موقعنا. تساعد هذه الملفات في تذكر تفضيلاتك وتحسين تجربتك.</p>
                <p>هناك نوعان رئيسيان من الكوكيز:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>كوكيز الجلسة:</strong> تُحذف عند إغلاق المتصفح</li>
                  <li><strong>الكوكيز الدائمة:</strong> تبقى على جهازك لفترة محددة</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <p>Cookies are small text files stored on your device when you visit our website. They help remember your preferences and improve your experience.</p>
                <p>There are two main types of cookies:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent cookies:</strong> Remain on your device for a set period</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? '2. أنواع الكوكيز المستخدمة' : '2. Types of Cookies We Use'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Essential Cookies */}
            <div className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {currentLanguage === 'ar' ? 'الكوكيز الأساسية' : 'Essential Cookies'}
                </h3>
                <Badge variant="destructive">
                  {currentLanguage === 'ar' ? 'مطلوبة' : 'Required'}
                </Badge>
              </div>
              {currentLanguage === 'ar' ? (
                <div className="text-right" dir="rtl">
                  <p className="mb-2">ضرورية لعمل الموقع بشكل صحيح ولا يمكن إيقافها.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>كوكيز الأمان والمصادقة</li>
                    <li>كوكيز إدارة الجلسات</li>
                    <li>كوكيز التوازن في التحميل</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Necessary for the website to function properly and cannot be switched off.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Security and authentication cookies</li>
                    <li>Session management cookies</li>
                    <li>Load balancing cookies</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Functional Cookies */}
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {currentLanguage === 'ar' ? 'الكوكيز الوظيفية' : 'Functional Cookies'}
                </h3>
                <Badge variant="outline">
                  {currentLanguage === 'ar' ? 'اختيارية' : 'Optional'}
                </Badge>
              </div>
              {currentLanguage === 'ar' ? (
                <div className="text-right" dir="rtl">
                  <p className="mb-2">تحسن من وظائف الموقع وتذكر تفضيلاتك.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>إعدادات اللغة والعملة</li>
                    <li>تفضيلات العرض</li>
                    <li>المحتوى المخصص</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Enhance website functionality and remember your preferences.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Language and currency settings</li>
                    <li>Display preferences</li>
                    <li>Personalized content</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Analytics Cookies */}
            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {currentLanguage === 'ar' ? 'كوكيز التحليلات' : 'Analytics Cookies'}
                </h3>
                <Badge variant="outline">
                  {currentLanguage === 'ar' ? 'اختيارية' : 'Optional'}
                </Badge>
              </div>
              {currentLanguage === 'ar' ? (
                <div className="text-right" dir="rtl">
                  <p className="mb-2">تساعدنا في فهم كيفية استخدام الموقع وتحسين الأداء.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>إحصائيات الزيارات</li>
                    <li>صفحات الأكثر شعبية</li>
                    <li>مسارات التنقل</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Help us understand how the website is used and improve performance.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Visit statistics</li>
                    <li>Most popular pages</li>
                    <li>Navigation paths</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Marketing Cookies */}
            <div className="border-l-4 border-orange-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {currentLanguage === 'ar' ? 'كوكيز التسويق' : 'Marketing Cookies'}
                </h3>
                <Badge variant="outline">
                  {currentLanguage === 'ar' ? 'اختيارية' : 'Optional'}
                </Badge>
              </div>
              {currentLanguage === 'ar' ? (
                <div className="text-right" dir="rtl">
                  <p className="mb-2">تُستخدم لعرض إعلانات ذات صلة بناءً على اهتماماتك.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>تتبع الإعلانات</li>
                    <li>الاستهداف المخصص</li>
                    <li>قياس فعالية الحملات</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Used to show relevant advertisements based on your interests.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Ad tracking</li>
                    <li>Personalized targeting</li>
                    <li>Campaign effectiveness measurement</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? '3. إدارة الكوكيز' : '3. Managing Cookies'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>يمكنك إدارة إعدادات الكوكيز بعدة طرق:</p>
                <h4 className="font-semibold">من خلال المتصفح:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Chrome: الإعدادات &gt; الخصوصية والأمان &gt; ملفات تعريف الارتباط</li>
                  <li>Firefox: الإعدادات &gt; الخصوصية والأمان &gt; ملفات تعريف الارتباط</li>
                  <li>Safari: التفضيلات &gt; الخصوصية &gt; إدارة بيانات الموقع</li>
                  <li>Edge: الإعدادات &gt; ملفات تعريف الارتباط والأذونات</li>
                </ul>
                <h4 className="font-semibold">من خلال إعدادات الموقع:</h4>
                <p>يمكنك تغيير تفضيلات الكوكيز في أي وقت من خلال رابط "إعدادات الكوكيز" في أسفل الصفحة.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>You can manage cookie settings in several ways:</p>
                <h4 className="font-semibold">Through Your Browser:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Chrome: Settings &gt; Privacy and Security &gt; Cookies</li>
                  <li>Firefox: Settings &gt; Privacy &amp; Security &gt; Cookies</li>
                  <li>Safari: Preferences &gt; Privacy &gt; Manage Website Data</li>
                  <li>Edge: Settings &gt; Cookies and Site Permissions</li>
                </ul>
                <h4 className="font-semibold">Through Website Settings:</h4>
                <p>You can change your cookie preferences at any time through the "Cookie Settings" link at the bottom of the page.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? '4. طرف ثالث ومقدمو الخدمات' : '4. Third Parties and Service Providers'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>نتعامل مع طرف ثالث موثوق لتحسين خدماتنا:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Google Analytics:</strong> لتحليل استخدام الموقع</li>
                  <li><strong>Stripe:</strong> لمعالجة المدفوعات بشكل آمن</li>
                  <li><strong>مقدمو خدمات الاستضافة:</strong> لضمان استقرار الموقع</li>
                </ul>
                <p>كل هؤلاء المقدمين لديهم سياسات خصوصية خاصة بهم ويلتزمون بمعايير الأمان العالية.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>We work with trusted third parties to improve our services:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Google Analytics:</strong> For website usage analysis</li>
                  <li><strong>Stripe:</strong> For secure payment processing</li>
                  <li><strong>Hosting providers:</strong> For website stability</li>
                </ul>
                <p>All these providers have their own privacy policies and adhere to high security standards.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? '5. التواصل معنا' : '5. Contact Us'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>إذا كانت لديك أسئلة حول سياسة الكوكيز:</p>
                <ul className="list-none space-y-2">
                  <li>البريد الإلكتروني: privacy@party2book.com</li>
                  <li>الهاتف: +971-4-XXX-XXXX</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <p>If you have questions about our cookie policy:</p>
                <ul className="list-none space-y-2">
                  <li>Email: privacy@party2book.com</li>
                  <li>Phone: +971-4-XXX-XXXX</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}