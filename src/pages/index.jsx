import 'leaflet/dist/leaflet.css';


import Layout from "./Layout.jsx";

import Home from "./Home";

import Browse from "./Browse";

import VenueDetails from "./VenueDetails";

import BookVenue from "./BookVenue";

import MyBookings from "./MyBookings";

import UserProfile from "./UserProfile";

import AddVenue from "./AddVenue";

import MyVenues from "./MyVenues";

import Payment from "./Payment";

import PaymentRecovery from "./PaymentRecovery";

import RefundRequest from "./RefundRequest";

import WriteReview from "./WriteReview";

import ReportVenue from "./ReportVenue";

import DeleteAccount from "./DeleteAccount";

import ChangeBooking from "./ChangeBooking";

import CancelBooking from "./CancelBooking";

import Messages from "./Messages";

import VenueMap from "./VenueMap";

import ApiManagement from "./ApiManagement";

import EnterpriseManagement from "./EnterpriseManagement";

import AdminDashboard from "./AdminDashboard";

import CleanupVenues from "./CleanupVenues";

import CleanupDatabase from "./CleanupDatabase";

import TestEmailSystem from "./TestEmailSystem";

import ConfigureStripe from "./ConfigureStripe";

import SystemMonitoring from "./SystemMonitoring";

import EditVenue from "./EditVenue";

import PaymentSuccess from "./PaymentSuccess";

import PaymentCancelled from "./PaymentCancelled";

import MyFavorites from "./MyFavorites";

import SecuritySettings from "./SecuritySettings";

import TermsOfService from "./TermsOfService";

import PrivacyPolicy from "./PrivacyPolicy";

import CookiePolicy from "./CookiePolicy";

import CancellationPolicy from "./CancellationPolicy";

import CommunityGuidelines from "./CommunityGuidelines";

import TestReviewReportFlows from "./TestReviewReportFlows";

import RobotsTxt from "./RobotsTxt";

import Sitemap from "./Sitemap";

import PublicHome from "./PublicHome";

import MobileBookingTest from "./MobileBookingTest";

import GuestCheckout from "./GuestCheckout";

import TrustSafety from "./TrustSafety";

import IntegrationTestSuite from "./IntegrationTestSuite";

import DatabaseOptimization from "./DatabaseOptimization";

import CloudStorageConfig from "./CloudStorageConfig";

import PaymentIntegrationConfig from "./PaymentIntegrationConfig";

import ProductionReadiness from "./ProductionReadiness";

import PerformanceOptimization from "./PerformanceOptimization";

import SystemHealthMonitor from "./SystemHealthMonitor";

import IntelligenceSuite from "./IntelligenceSuite";

import BrowseVendors from "./BrowseVendors";

import VendorProfile from "./VendorProfile";

import SupportCenter from "./SupportCenter";

import SmartDashboard from "./SmartDashboard";

import DeploymentDashboard from "./DeploymentDashboard";

import OperationalDashboard from "./OperationalDashboard";

import LaunchReadinessCheck from "./LaunchReadinessCheck";

import AddVendor from "./AddVendor";

import MyVendorProfile from "./MyVendorProfile";

import EditVendor from "./EditVendor";

import VendorSubscription from "./VendorSubscription";

import SubscriptionSuccess from "./SubscriptionSuccess";

import ContentManager from "./ContentManager";

import MarketingDashboard from "./MarketingDashboard";

import VenueComparison from "./VenueComparison";

import GroupBooking from "./GroupBooking";

import OwnerFinancials from "./OwnerFinancials";

import AdminSettings from "./AdminSettings";

import PlatformSettingsManager from "./PlatformSettingsManager";

import DisputeResolution from "./DisputeResolution";

import OpenDispute from "./OpenDispute";

import DisputeDetails from "./DisputeDetails";

import EndToEndTests from "./EndToEndTests";

import SimulatedPayment from "./SimulatedPayment";

import VendorBookingDetails from "./VendorBookingDetails";

import WriteVendorReview from "./WriteVendorReview";

import TestRefundFlow from "./TestRefundFlow";

import TestSystemFlows from "./TestSystemFlows";

import FlowDiagnostics from "./FlowDiagnostics";

import SmokeTest from "./SmokeTest";

import OwnerDashboard from "./OwnerDashboard";

import RoleTesting from "./RoleTesting";

import VendorDashboard from "./VendorDashboard";

import AdminReportCenter from "./AdminReportCenter";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Browse: Browse,
    
    VenueDetails: VenueDetails,
    
    BookVenue: BookVenue,
    
    MyBookings: MyBookings,
    
    UserProfile: UserProfile,
    
    AddVenue: AddVenue,
    
    MyVenues: MyVenues,
    
    Payment: Payment,
    
    PaymentRecovery: PaymentRecovery,
    
    RefundRequest: RefundRequest,
    
    WriteReview: WriteReview,
    
    ReportVenue: ReportVenue,
    
    DeleteAccount: DeleteAccount,
    
    ChangeBooking: ChangeBooking,
    
    CancelBooking: CancelBooking,
    
    Messages: Messages,
    
    VenueMap: VenueMap,
    
    ApiManagement: ApiManagement,
    
    EnterpriseManagement: EnterpriseManagement,
    
    AdminDashboard: AdminDashboard,
    
    CleanupVenues: CleanupVenues,
    
    CleanupDatabase: CleanupDatabase,
    
    TestEmailSystem: TestEmailSystem,
    
    ConfigureStripe: ConfigureStripe,
    
    SystemMonitoring: SystemMonitoring,
    
    EditVenue: EditVenue,
    
    PaymentSuccess: PaymentSuccess,
    
    PaymentCancelled: PaymentCancelled,
    
    MyFavorites: MyFavorites,
    
    SecuritySettings: SecuritySettings,
    
    TermsOfService: TermsOfService,
    
    PrivacyPolicy: PrivacyPolicy,
    
    CookiePolicy: CookiePolicy,
    
    CancellationPolicy: CancellationPolicy,
    
    CommunityGuidelines: CommunityGuidelines,
    
    TestReviewReportFlows: TestReviewReportFlows,
    
    RobotsTxt: RobotsTxt,
    
    Sitemap: Sitemap,
    
    PublicHome: PublicHome,
    
    MobileBookingTest: MobileBookingTest,
    
    GuestCheckout: GuestCheckout,
    
    TrustSafety: TrustSafety,
    
    IntegrationTestSuite: IntegrationTestSuite,
    
    DatabaseOptimization: DatabaseOptimization,
    
    CloudStorageConfig: CloudStorageConfig,
    
    PaymentIntegrationConfig: PaymentIntegrationConfig,
    
    ProductionReadiness: ProductionReadiness,
    
    PerformanceOptimization: PerformanceOptimization,
    
    SystemHealthMonitor: SystemHealthMonitor,
    
    IntelligenceSuite: IntelligenceSuite,
    
    BrowseVendors: BrowseVendors,
    
    VendorProfile: VendorProfile,
    
    SupportCenter: SupportCenter,
    
    SmartDashboard: SmartDashboard,
    
    DeploymentDashboard: DeploymentDashboard,
    
    OperationalDashboard: OperationalDashboard,
    
    LaunchReadinessCheck: LaunchReadinessCheck,
    
    AddVendor: AddVendor,
    
    MyVendorProfile: MyVendorProfile,
    
    EditVendor: EditVendor,
    
    VendorSubscription: VendorSubscription,
    
    SubscriptionSuccess: SubscriptionSuccess,
    
    ContentManager: ContentManager,
    
    MarketingDashboard: MarketingDashboard,
    
    VenueComparison: VenueComparison,
    
    GroupBooking: GroupBooking,
    
    OwnerFinancials: OwnerFinancials,
    
    AdminSettings: AdminSettings,
    
    PlatformSettingsManager: PlatformSettingsManager,
    
    DisputeResolution: DisputeResolution,
    
    OpenDispute: OpenDispute,
    
    DisputeDetails: DisputeDetails,
    
    EndToEndTests: EndToEndTests,
    
    SimulatedPayment: SimulatedPayment,
    
    VendorBookingDetails: VendorBookingDetails,
    
    WriteVendorReview: WriteVendorReview,
    
    TestRefundFlow: TestRefundFlow,
    
    TestSystemFlows: TestSystemFlows,
    
    FlowDiagnostics: FlowDiagnostics,
    
    SmokeTest: SmokeTest,
    
    OwnerDashboard: OwnerDashboard,
    
    RoleTesting: RoleTesting,
    
    VendorDashboard: VendorDashboard,
    
    AdminReportCenter: AdminReportCenter,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Browse" element={<Browse />} />
                
                <Route path="/VenueDetails" element={<VenueDetails />} />
                
                <Route path="/BookVenue" element={<BookVenue />} />
                
                <Route path="/MyBookings" element={<MyBookings />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/AddVenue" element={<AddVenue />} />
                
                <Route path="/MyVenues" element={<MyVenues />} />
                
                <Route path="/Payment" element={<Payment />} />
                
                <Route path="/PaymentRecovery" element={<PaymentRecovery />} />
                
                <Route path="/RefundRequest" element={<RefundRequest />} />
                
                <Route path="/WriteReview" element={<WriteReview />} />
                
                <Route path="/ReportVenue" element={<ReportVenue />} />
                
                <Route path="/DeleteAccount" element={<DeleteAccount />} />
                
                <Route path="/ChangeBooking" element={<ChangeBooking />} />
                
                <Route path="/CancelBooking" element={<CancelBooking />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/VenueMap" element={<VenueMap />} />
                
                <Route path="/ApiManagement" element={<ApiManagement />} />
                
                <Route path="/EnterpriseManagement" element={<EnterpriseManagement />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/CleanupVenues" element={<CleanupVenues />} />
                
                <Route path="/CleanupDatabase" element={<CleanupDatabase />} />
                
                <Route path="/TestEmailSystem" element={<TestEmailSystem />} />
                
                <Route path="/ConfigureStripe" element={<ConfigureStripe />} />
                
                <Route path="/SystemMonitoring" element={<SystemMonitoring />} />
                
                <Route path="/EditVenue" element={<EditVenue />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/PaymentCancelled" element={<PaymentCancelled />} />
                
                <Route path="/MyFavorites" element={<MyFavorites />} />
                
                <Route path="/SecuritySettings" element={<SecuritySettings />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/CookiePolicy" element={<CookiePolicy />} />
                
                <Route path="/CancellationPolicy" element={<CancellationPolicy />} />
                
                <Route path="/CommunityGuidelines" element={<CommunityGuidelines />} />
                
                <Route path="/TestReviewReportFlows" element={<TestReviewReportFlows />} />
                
                <Route path="/RobotsTxt" element={<RobotsTxt />} />
                
                <Route path="/Sitemap" element={<Sitemap />} />
                
                <Route path="/PublicHome" element={<PublicHome />} />
                
                <Route path="/MobileBookingTest" element={<MobileBookingTest />} />
                
                <Route path="/GuestCheckout" element={<GuestCheckout />} />
                
                <Route path="/TrustSafety" element={<TrustSafety />} />
                
                <Route path="/IntegrationTestSuite" element={<IntegrationTestSuite />} />
                
                <Route path="/DatabaseOptimization" element={<DatabaseOptimization />} />
                
                <Route path="/CloudStorageConfig" element={<CloudStorageConfig />} />
                
                <Route path="/PaymentIntegrationConfig" element={<PaymentIntegrationConfig />} />
                
                <Route path="/ProductionReadiness" element={<ProductionReadiness />} />
                
                <Route path="/PerformanceOptimization" element={<PerformanceOptimization />} />
                
                <Route path="/SystemHealthMonitor" element={<SystemHealthMonitor />} />
                
                <Route path="/IntelligenceSuite" element={<IntelligenceSuite />} />
                
                <Route path="/BrowseVendors" element={<BrowseVendors />} />
                
                <Route path="/VendorProfile" element={<VendorProfile />} />
                
                <Route path="/SupportCenter" element={<SupportCenter />} />
                
                <Route path="/SmartDashboard" element={<SmartDashboard />} />
                
                <Route path="/DeploymentDashboard" element={<DeploymentDashboard />} />
                
                <Route path="/OperationalDashboard" element={<OperationalDashboard />} />
                
                <Route path="/LaunchReadinessCheck" element={<LaunchReadinessCheck />} />
                
                <Route path="/AddVendor" element={<AddVendor />} />
                
                <Route path="/MyVendorProfile" element={<MyVendorProfile />} />
                
                <Route path="/EditVendor" element={<EditVendor />} />
                
                <Route path="/VendorSubscription" element={<VendorSubscription />} />
                
                <Route path="/SubscriptionSuccess" element={<SubscriptionSuccess />} />
                
                <Route path="/ContentManager" element={<ContentManager />} />
                
                <Route path="/MarketingDashboard" element={<MarketingDashboard />} />
                
                <Route path="/VenueComparison" element={<VenueComparison />} />
                
                <Route path="/GroupBooking" element={<GroupBooking />} />
                
                <Route path="/OwnerFinancials" element={<OwnerFinancials />} />
                
                <Route path="/AdminSettings" element={<AdminSettings />} />
                
                <Route path="/PlatformSettingsManager" element={<PlatformSettingsManager />} />
                
                <Route path="/DisputeResolution" element={<DisputeResolution />} />
                
                <Route path="/OpenDispute" element={<OpenDispute />} />
                
                <Route path="/DisputeDetails" element={<DisputeDetails />} />
                
                <Route path="/EndToEndTests" element={<EndToEndTests />} />
                
                <Route path="/SimulatedPayment" element={<SimulatedPayment />} />
                
                <Route path="/VendorBookingDetails" element={<VendorBookingDetails />} />
                
                <Route path="/WriteVendorReview" element={<WriteVendorReview />} />
                
                <Route path="/TestRefundFlow" element={<TestRefundFlow />} />
                
                <Route path="/TestSystemFlows" element={<TestSystemFlows />} />
                
                <Route path="/FlowDiagnostics" element={<FlowDiagnostics />} />
                
                <Route path="/SmokeTest" element={<SmokeTest />} />
                
                <Route path="/OwnerDashboard" element={<OwnerDashboard />} />
                
                <Route path="/RoleTesting" element={<RoleTesting />} />
                
                <Route path="/VendorDashboard" element={<VendorDashboard />} />
                
                <Route path="/AdminReportCenter" element={<AdminReportCenter />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}