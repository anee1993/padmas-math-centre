import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-gray-600 mb-4">
            Welcome, {user?.email}!
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700 mb-2">
            Your account has been created successfully, but it needs to be approved by your teacher before you can access the platform.
          </p>
          <p className="text-gray-600 text-sm">
            You will receive an email notification once your account is approved. This usually takes 1-2 business days.
          </p>
        </div>

        <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">What happens next?</h3>
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">1.</span>
            <p className="text-sm text-gray-600">Your teacher will review your registration</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">2.</span>
            <p className="text-sm text-gray-600">You'll receive an email when approved</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">3.</span>
            <p className="text-sm text-gray-600">Log in again to access your dashboard</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition font-medium"
        >
          Logout
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Need help? Contact your teacher at the tuition center.
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;
