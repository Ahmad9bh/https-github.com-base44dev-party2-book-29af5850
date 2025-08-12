import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/components/common/LocalizationContext';
import { Users, Heart, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CommunityGuidelines() {
  const { currentLanguage } = useLocalization();

  React.useEffect(() => {
    document.title = `Community Guidelines | Party2Book`;
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentLanguage === 'ar' ? 'إرشادات المجتمع' : 'Community Guidelines'}
        </h1>
        <p className="text-gray-600">
          {currentLanguage === 'ar' 
            ? 'آخر تحديث: ديسمبر 2024'
            : 'Last updated: December 2024'
          }
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <div className="flex items-start gap-4">
          <Heart className="w-8 h-8 text-blue-600 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              {currentLanguage === 'ar' ? 'مرحباً بك في مجتمع Party2Book' : 'Welcome to the Party2Book Community'}
            </h2>
            <p className="text-blue-800">
              {currentLanguage === 'ar' 
                ? 'نحن نسعى لخلق مساحة آمنة ومحترمة لجميع أعضاء مجتمعنا. هذه الإرشادات تساعدنا في الحفاظ على بيئة إيجابية للجميع.'
                : 'We strive to create a safe and respectful space for all members of our community. These guidelines help us maintain a positive environment for everyone.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {currentLanguage === 'ar' ? 'السلوك المطلوب' : 'Expected Behavior'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentLanguage === 'ar' ? (
              <div className="text-right" dir="rtl">
                <p className="mb-4">نتوقع من جميع أعضاء مجتمعنا:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>الاحترام المتبادل:</strong> تعامل مع الآخرين بلطف واحترام، بغض النظر عن خلفياتهم أو آرائهم
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>الصدق والشفافية:</strong> قدم معلومات دقيقة عن الأماكن والحجوزات
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>التواصل الإيجابي:</strong> استخدم لغة مهذبة ومهنية في جميع التفاعلات
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>احترام الخصوصية:</strong> لا تشارك المعلومات الشخصية للآخرين دون إذن
                    </div>
                  </li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="mb-4">We expect all community members to:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Show mutual respect:</strong> Treat others with kindness and respect, regardless of their background or opinions
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Be honest and transparent:</strong> Provide accurate information about venues and bookings
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Communicate positively:</strong> Use polite and professional language in all interactions
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Respect privacy:</strong> Don't share others' personal information without permission
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              {currentLanguage === 'ar' ? 'السلوك المحظور' : 'Prohibited Behavior'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentLanguage === 'ar' ? (
              <div className="text-right" dir="rtl">
                <p className="mb-4">الأنشطة التالية محظورة تماماً:</p>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-700 mb-2">التحرش والإساءة</h4>
                    <ul className="text-sm space-y-1">
                      <li>• التنمر أو التحرش بأي شكل</li>
                      <li>• اللغة المسيئة أو التهديدية</li>
                      <li>• المضايقات المستمرة</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-700 mb-2">المعلومات المضللة</h4>
                    <ul className="text-sm space-y-1">
                      <li>• تقديم معلومات كاذبة عن الأماكن</li>
                      <li>• صور مزيفة أو غير حقيقية</li>
                      <li>• أسعار أو تفاصيل غير دقيقة</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-700 mb-2">الأنشطة غير القانونية</h4>
                    <ul className="text-sm space-y-1">
                      <li>• أي أنشطة تخالف القوانين المحلية</li>
                      <li>• المحتوى الإباحي أو غير اللائق</li>
                      <li>• انتهاك حقوق الطبع والنشر</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4">The following activities are strictly prohibited:</p>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-700 mb-2">Harassment and Abuse</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Bullying or harassment in any form</li>
                      <li>• Abusive or threatening language</li>
                      <li>• Persistent unwanted contact</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-700 mb-2">Misleading Information</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Providing false venue information</li>
                      <li>• Fake or misleading photos</li>
                      <li>• Inaccurate pricing or details</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-red-700 mb-2">Illegal Activities</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Any activities that violate local laws</li>
                      <li>• Adult or inappropriate content</li>
                      <li>• Copyright infringement</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {currentLanguage === 'ar' ? 'للعملاء' : 'For Customers'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <h4 className="font-semibold">عند حجز الأماكن:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>اقرأ جميع التفاصيل والشروط بعناية</li>
                  <li>تواصل بوضوح مع أصحاب الأماكن</li>
                  <li>احترم قوانين وقواعد المكان</li>
                  <li>اترك تقييمات صادقة ومفيدة</li>
                </ul>
                <h4 className="font-semibold">أثناء الحدث:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>عامل المكان بعناية واحترام</li>
                  <li>التزم بعدد الضيوف المتفق عليه</li>
                  <li>اتبع قواعد السلامة والأمان</li>
                  <li>أبلغ عن أي مشاكل فوراً</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold">When booking venues:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Read all details and terms carefully</li>
                  <li>Communicate clearly with venue owners</li>
                  <li>Respect venue rules and regulations</li>
                  <li>Leave honest and helpful reviews</li>
                </ul>
                <h4 className="font-semibold">During events:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Treat the venue with care and respect</li>
                  <li>Stick to agreed guest numbers</li>
                  <li>Follow safety and security guidelines</li>
                  <li>Report any issues immediately</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              {currentLanguage === 'ar' ? 'لأصحاب الأماكن' : 'For Venue Owners'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <h4 className="font-semibold">عند إدراج الأماكن:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>استخدم صور حقيقية وحديثة للمكان</li>
                  <li>اكتب أوصاف دقيقة وشاملة</li>
                  <li>حدد الأسعار والشروط بوضوح</li>
                  <li>اذكر جميع القيود والقوانين</li>
                </ul>
                <h4 className="font-semibold">مع العملاء:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>رد على الاستفسارات بسرعة</li>
                  <li>كن مرناً ومتفهماً</li>
                  <li>اتبع سياسات الإلغاء المعلنة</li>
                  <li>حافظ على مستوى عالٍ من الخدمة</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold">When listing venues:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Use real and recent photos of your venue</li>
                  <li>Write accurate and comprehensive descriptions</li>
                  <li>Set clear pricing and terms</li>
                  <li>Mention all restrictions and rules</li>
                </ul>
                <h4 className="font-semibold">With customers:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Respond to inquiries promptly</li>
                  <li>Be flexible and understanding</li>
                  <li>Follow stated cancellation policies</li>
                  <li>Maintain high service standards</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? 'الإبلاغ والإنفاذ' : 'Reporting and Enforcement'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <h4 className="font-semibold">كيفية الإبلاغ:</h4>
                <p>إذا واجهت سلوكاً يخالف هذه الإرشادات:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>استخدم زر "الإبلاغ" المتاح في كل صفحة</li>
                  <li>أرسل بريد إلكتروني إلى: report@party2book.com</li>
                  <li>اتصل بخدمة العملاء مباشرة</li>
                </ul>
                <h4 className="font-semibold">الإجراءات التأديبية:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">الإنذار الأول</Badge>
                    <span>تحذير رسمي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">الإنذار الثاني</Badge>
                    <span>تقييد مؤقت للحساب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">المخالفة الثالثة</Badge>
                    <span>إيقاف دائم للحساب</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold">How to Report:</h4>
                <p>If you encounter behavior that violates these guidelines:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Use the "Report" button available on each page</li>
                  <li>Send an email to: report@party2book.com</li>
                  <li>Contact customer service directly</li>
                </ul>
                <h4 className="font-semibold">Disciplinary Actions:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">First Warning</Badge>
                    <span>Official warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Second Warning</Badge>
                    <span>Temporary account restriction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Third Violation</Badge>
                    <span>Permanent account suspension</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ar' ? 'تطوير المجتمع' : 'Community Development'}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {currentLanguage === 'ar' ? (
              <div className="space-y-4 text-right" dir="rtl">
                <p>نسعى لتطوير مجتمعنا باستمرار من خلال:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>الاستماع لاقتراحاتكم وملاحظاتكم</li>
                  <li>تحديث الإرشادات بناءً على التجارب</li>
                  <li>تطوير برامج للأعضاء المميزين</li>
                  <li>إقامة فعاليات تفاعلية</li>
                </ul>
                <p>شاركونا آراءكم على: feedback@party2book.com</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>We continuously develop our community through:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Listening to your suggestions and feedback</li>
                  <li>Updating guidelines based on experiences</li>
                  <li>Developing programs for outstanding members</li>
                  <li>Hosting interactive events</li>
                </ul>
                <p>Share your feedback with us at: feedback@party2book.com</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}