import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api-production';

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showWeeklyForm, setShowWeeklyForm] = useState(false);
  const [showFestiveForm, setShowFestiveForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [weeklyOffer, setWeeklyOffer] = useState({
    offerTitle: '',
    offerDescription: '',
    validUntil: '',
    clientFilter: { status: 'all' }
  });

  const [festiveCampaign, setFestiveCampaign] = useState({
    festivalName: '',
    packageTitle: '',
    packageDescription: '',
    discount: '',
    deadline: '',
    clientFilter: { status: 'all' }
  });

  useEffect(() => {
    loadCampaignHistory();
  }, []);

  const loadCampaignHistory = async () => {
    try {
      const response = await apiService.getCampaignHistory();
      setCampaigns(response.campaigns || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const sendWeeklyOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.sendWeeklyOffer(weeklyOffer);
      alert('Weekly offer campaign sent successfully!');
      setShowWeeklyForm(false);
      setWeeklyOffer({
        offerTitle: '',
        offerDescription: '',
        validUntil: '',
        clientFilter: { status: 'all' }
      });
      loadCampaignHistory();
    } catch (error) {
      alert('Failed to send campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendFestiveCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.sendFestiveCampaign(festiveCampaign);
      alert('Festive campaign sent successfully!');
      setShowFestiveForm(false);
      setFestiveCampaign({
        festivalName: '',
        packageTitle: '',
        packageDescription: '',
        discount: '',
        deadline: '',
        clientFilter: { status: 'all' }
      });
      loadCampaignHistory();
    } catch (error) {
      alert('Failed to send campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Email Marketing</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowWeeklyForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Weekly Offer
          </button>
          <button
            onClick={() => setShowFestiveForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Festive Campaign
          </button>
        </div>
      </div>

      {/* Weekly Offer Form */}
      {showWeeklyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Weekly Offer</h3>
            <form onSubmit={sendWeeklyOffer}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Title
                </label>
                <input
                  type="text"
                  value={weeklyOffer.offerTitle}
                  onChange={(e) => setWeeklyOffer({...weeklyOffer, offerTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20% Off Portrait Sessions"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={weeklyOffer.offerDescription}
                  onChange={(e) => setWeeklyOffer({...weeklyOffer, offerDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Book your portrait session this week and save 20%!"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="text"
                  value={weeklyOffer.validUntil}
                  onChange={(e) => setWeeklyOffer({...weeklyOffer, validUntil: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="End of this week"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send to
                </label>
                <select
                  value={weeklyOffer.clientFilter.status}
                  onChange={(e) => setWeeklyOffer({...weeklyOffer, clientFilter: { status: e.target.value }})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Clients</option>
                  <option value="lead">Leads Only</option>
                  <option value="active">Active Clients</option>
                  <option value="completed">Past Clients</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWeeklyForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Festive Campaign Form */}
      {showFestiveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Festive Campaign</h3>
            <form onSubmit={sendFestiveCampaign}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Festival Name
                </label>
                <input
                  type="text"
                  value={festiveCampaign.festivalName}
                  onChange={(e) => setFestiveCampaign({...festiveCampaign, festivalName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Christmas"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Title
                </label>
                <input
                  type="text"
                  value={festiveCampaign.packageTitle}
                  onChange={(e) => setFestiveCampaign({...festiveCampaign, packageTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Holiday Family Package"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={festiveCampaign.packageDescription}
                  onChange={(e) => setFestiveCampaign({...festiveCampaign, packageDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="Capture your special moments with our premium festive package"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount
                </label>
                <input
                  type="text"
                  value={festiveCampaign.discount}
                  onChange={(e) => setFestiveCampaign({...festiveCampaign, discount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="30% OFF"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="text"
                  value={festiveCampaign.deadline}
                  onChange={(e) => setFestiveCampaign({...festiveCampaign, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="December 31st"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send to
                </label>
                <select
                  value={festiveCampaign.clientFilter.status}
                  onChange={(e) => setFestiveCampaign({...festiveCampaign, clientFilter: { status: e.target.value }})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Clients</option>
                  <option value="lead">Leads Only</option>
                  <option value="active">Active Clients</option>
                  <option value="completed">Past Clients</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFestiveForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign History */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Subject</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Client</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="border border-gray-200 px-4 py-2">
                    {new Date(campaign.sent_at).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.campaign_type === 'weekly_offer' ? 'bg-blue-100 text-blue-800' :
                      campaign.campaign_type === 'festive' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {campaign.campaign_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">{campaign.subject}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    {campaign.name} ({campaign.email})
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No campaigns sent yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailCampaigns;