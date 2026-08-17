import { useState, useEffect } from "react";
import { apiService } from "../services/api-production";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "lead" | "consultation-scheduled" | "proposal-sent" | "booked" | "completed";
  eventType: string;
  eventDate?: string;
  budget?: string;
  consultationDate?: string;
  consultationTime?: string;
  lastContact: string;
  notes: string;
  tags: string[];
}

export function CRMDashboard() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await apiService.getClients();
      setClients(response.clients || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "consultation-scheduled":
        return "bg-purple-100 text-purple-800";
      case "proposal-sent":
        return "bg-yellow-100 text-yellow-800";
      case "booked":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredClients =
    filterStatus === "all"
      ? clients
      : clients.filter((client) => client.status === filterStatus);

  const stats = {
    totalLeads: clients.filter((c) => c.status === "lead").length,
    consultationsScheduled: clients.filter((c) => c.status === "consultation-scheduled").length,
    proposalsSent: clients.filter((c) => c.status === "proposal-sent").length,
    booked: clients.filter((c) => c.status === "booked").length,
  };

  const handleAddNote = async () => {
    if (newNote.trim() && selectedClient) {
      try {
        await apiService.addClientNote(selectedClient.id, newNote.trim());
        await loadClients();
        setNewNote("");
        setShowAddNote(false);
      } catch (error: any) {
        console.error('Failed to add note:', error);
      }
    }
  };

  return (
    <section className="min-h-screen pt-24 pb-16 luxury-gradient-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl luxury-heading text-primary mb-2">
            CLIENT RELATIONSHIP MANAGER
          </h1>
          <p className="luxury-body text-gray-600">
            Manage your client relationships, consultations, and bookings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="luxury-card p-6">
                <div className="text-3xl font-light text-primary mb-2">{stats.totalLeads}</div>
                <div className="text-sm luxury-body text-gray-600">New Leads</div>
              </div>
              <div className="luxury-card p-6">
                <div className="text-3xl font-light text-primary mb-2">
                  {stats.consultationsScheduled}
                </div>
                <div className="text-sm luxury-body text-gray-600">Consultations Scheduled</div>
              </div>
              <div className="luxury-card p-6">
                <div className="text-3xl font-light text-primary mb-2">{stats.proposalsSent}</div>
                <div className="text-sm luxury-body text-gray-600">Proposals Sent</div>
              </div>
              <div className="luxury-card p-6">
                <div className="text-3xl font-light text-primary mb-2">{stats.booked}</div>
                <div className="text-sm luxury-body text-gray-600">Booked Clients</div>
              </div>
            </div>

            {/* Filters */}
            <div className="luxury-card p-6 mb-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-6 py-3 text-sm font-light tracking-wide transition-all duration-300 ${
                    filterStatus === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Clients ({clients.length})
                </button>
                <button
                  onClick={() => setFilterStatus("lead")}
                  className={`px-4 py-2 text-sm font-light tracking-wide transition-colors ${
                    filterStatus === "lead"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Leads ({stats.totalLeads})
                </button>
                <button
                  onClick={() => setFilterStatus("consultation-scheduled")}
                  className={`px-4 py-2 text-sm font-light tracking-wide transition-colors ${
                    filterStatus === "consultation-scheduled"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Consultations ({stats.consultationsScheduled})
                </button>
                <button
                  onClick={() => setFilterStatus("proposal-sent")}
                  className={`px-4 py-2 text-sm font-light tracking-wide transition-colors ${
                    filterStatus === "proposal-sent"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Proposals ({stats.proposalsSent})
                </button>
                <button
                  onClick={() => setFilterStatus("booked")}
                  className={`px-4 py-2 text-sm font-light tracking-wide transition-colors ${
                    filterStatus === "booked"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Booked ({stats.booked})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client List */}
              <div className="lg:col-span-1 space-y-4">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`bg-white p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedClient?.id === client.id ? "ring-2 ring-gray-900" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-light text-gray-900">{client.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(client.status)}`}
                      >
                        {getStatusLabel(client.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 font-light">
                      <p>{client.eventType}</p>
                      {client.eventDate && <p>Event: {client.eventDate}</p>}
                      {client.consultationDate && (
                        <p>
                          Consultation: {client.consultationDate} at {client.consultationTime}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {client.tags && client.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Client Details */}
              <div className="lg:col-span-2">
                {selectedClient ? (
                  <div className="bg-white p-8 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-light text-gray-900 mb-2">
                          {selectedClient.name}
                        </h2>
                        <span
                          className={`text-sm px-3 py-1 rounded ${getStatusColor(
                            selectedClient.status
                          )}`}
                        >
                          {getStatusLabel(selectedClient.status)}
                        </span>
                      </div>
                      <button className="px-4 py-2 border border-gray-900 text-gray-900 text-sm font-light tracking-wide hover:bg-gray-900 hover:text-white transition-colors">
                        EDIT CLIENT
                      </button>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-8">
                      <h3 className="text-sm font-light tracking-wide text-gray-900 mb-4">
                        CONTACT INFORMATION
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 font-light">Email:</span>
                          <p className="text-gray-900 font-light">{selectedClient.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 font-light">Phone:</span>
                          <p className="text-gray-900 font-light">{selectedClient.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 font-light">Event Type:</span>
                          <p className="text-gray-900 font-light">{selectedClient.eventType}</p>
                        </div>
                        {selectedClient.eventDate && (
                          <div>
                            <span className="text-gray-600 font-light">Event Date:</span>
                            <p className="text-gray-900 font-light">{selectedClient.eventDate}</p>
                          </div>
                        )}
                        {selectedClient.budget && (
                          <div>
                            <span className="text-gray-600 font-light">Budget:</span>
                            <p className="text-gray-900 font-light">{selectedClient.budget}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 font-light">Last Contact:</span>
                          <p className="text-gray-900 font-light">{selectedClient.lastContact}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-8">
                      <h3 className="text-sm font-light tracking-wide text-gray-900 mb-4">TAGS</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedClient.tags && selectedClient.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-dashed border-gray-300 rounded">
                          + Add Tag
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-light tracking-wide text-gray-900">NOTES</h3>
                        <button
                          onClick={() => setShowAddNote(!showAddNote)}
                          className="text-sm text-gray-600 hover:text-gray-900 font-light"
                        >
                          + Add Note
                        </button>
                      </div>

                      {showAddNote && (
                        <div className="mb-4">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a note..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:outline-none font-light resize-none mb-2"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleAddNote}
                              className="px-4 py-2 bg-gray-900 text-white text-sm font-light tracking-wide hover:bg-gray-800 transition-colors"
                            >
                              SAVE NOTE
                            </button>
                            <button
                              onClick={() => {
                                setShowAddNote(false);
                                setNewNote("");
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-light tracking-wide hover:bg-gray-100 transition-colors"
                            >
                              CANCEL
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {selectedClient.notes && (
                          <div className="bg-gray-50 p-4">
                            <p className="text-sm text-gray-900 font-light whitespace-pre-wrap">{selectedClient.notes}</p>
                            <p className="text-xs text-gray-500 font-light mt-2">
                              {selectedClient.lastContact}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button className="px-6 py-3 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors">
                        SEND EMAIL
                      </button>
                      <button className="px-6 py-3 border border-gray-900 text-gray-900 font-light tracking-wide hover:bg-gray-100 transition-colors">
                        SEND PROPOSAL
                      </button>
                      <button className="px-6 py-3 border border-gray-900 text-gray-900 font-light tracking-wide hover:bg-gray-100 transition-colors">
                        SCHEDULE CONSULTATION
                      </button>
                      <button className="px-6 py-3 border border-gray-900 text-gray-900 font-light tracking-wide hover:bg-gray-100 transition-colors">
                        CREATE CONTRACT
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-12 shadow-sm text-center">
                    <p className="text-gray-500 font-light">
                      Select a client to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}