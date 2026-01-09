import { useLandingData } from '@/hooks/use-landing-data';
import { handleLinkClick } from '@/utils/link-handler';
import { SITE_NAME, getSiteNameWithYear, getRegistrationUrl, INSTAGRAM_URL } from '@/lib/site-config';

const BioSimple = () => {
  console.log('🚀 BioSimple component rendered');
  const { data: landingData } = useLandingData();
  const eventData = landingData?.event;

  const testData = [
    { id: 1, title: `🎫 Inscrições ${eventData?.eventTitle || getSiteNameWithYear('2025')}`, url: eventData?.registrationUrl || getRegistrationUrl() },
    { id: 2, title: "📍 Localização", url: "https://maps.google.com" },
    ...(INSTAGRAM_URL ? [{ id: 3, title: "📱 Instagram", url: INSTAGRAM_URL }] : [])
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">
          {getSiteNameWithYear('2025')} - Bio
        </h1>

        <div className="space-y-4">
          {testData.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.url, link.title)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-xl transition-colors"
            >
              {link.title}
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-bold mb-2">Debug Info:</h3>
          <p className="text-gray-300 text-sm">Links estáticos: {testData.length}</p>
          <p className="text-gray-300 text-sm">Status: Página estática funcionando</p>
          <p className="text-gray-300 text-sm">URL atual: {window.location.pathname}</p>
        </div>
      </div>
    </div>
  );
};

export default BioSimple;