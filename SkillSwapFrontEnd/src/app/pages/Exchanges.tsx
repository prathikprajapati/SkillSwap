import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Clock, BookOpen, GraduationCap } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Exchange {
  id: string;
  skillName: string;
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: string;
  completedAt: string | null;
  role: "teacher" | "learner";
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export default function Exchanges() {
  const { firebaseUser } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "teaching" | "learning">("all");

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      const idToken = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/exchanges`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exchanges");
      }

      const data = await response.json();
      setExchanges(data);
    } catch (err) {
      console.error("Error fetching exchanges:", err);
      setError(err instanceof Error ? err.message : "Failed to load exchanges");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (exchangeId: string) => {
    try {
      const idToken = await firebaseUser!.getIdToken();
      const response = await fetch(`${API_BASE_URL}/exchanges/${exchangeId}/complete`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to complete exchange");
      }

      // Refresh exchanges
      fetchExchanges();
    } catch (err) {
      console.error("Error completing exchange:", err);
      alert(err instanceof Error ? err.message : "Failed to complete exchange");
    }
  };

  const filteredExchanges = exchanges.filter((exchange) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "teaching") return exchange.role === "teacher";
    if (activeFilter === "learning") return exchange.role === "learner";
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "active":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "active":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const getRoleIcon = (role: string) => {
    return role === "teacher" ? (
      <GraduationCap className="h-4 w-4 text-primary" />
    ) : (
      <BookOpen className="h-4 w-4 text-secondary" />
    );
  };

  const getRoleText = (role: string) => {
    return role === "teacher" ? "Teaching" : "Learning";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-2xl md:text-3xl font-bold">My Exchanges</h1>
        </div>

        <p className="text-muted-foreground mb-8">
          Track your skill exchanges and learning progress
        </p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "all", label: "All Exchanges" },
            { id: "teaching", label: "Teaching" },
            { id: "learning", label: "Learning" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-xl text-error">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Exchanges List */}
        {!loading && filteredExchanges.length === 0 && (
          <div className="text-center py-12 bg-muted/50 rounded-xl">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No exchanges yet</h3>
            <p className="text-muted-foreground mb-4">
              {activeFilter === "all"
                ? "Start browsing skills to find learning opportunities"
                : activeFilter === "teaching"
                ? "Offer a skill to start teaching others"
                : "Browse available skills to start learning"}
            </p>
            <Link
              to="/browse"
              className="btn-primary inline-flex items-center gap-2"
            >
              Browse Skills
            </Link>
          </div>
        )}

        {!loading && filteredExchanges.length > 0 && (
          <div className="grid gap-4">
            {filteredExchanges.map((exchange) => (
              <div
                key={exchange.id}
                className="card-hover p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: Role & Skill */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                          exchange.role === "teacher"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary/10 text-secondary border-secondary/20"
                        }`}
                      >
                        {getRoleIcon(exchange.role)}
                        {getRoleText(exchange.role)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                          exchange.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                            : exchange.status === "active"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                            : exchange.status === "cancelled"
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
                        }`}
                      >
                        {getStatusIcon(exchange.status)}
                        {getStatusText(exchange.status)}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 leading-tight">
                      {exchange.role === "teacher" ? (
                        <>
                          You are teaching <span className="text-primary">{exchange.skillName}</span>
                        </>
                      ) : (
                        <>
                          You are learning <span className="text-secondary">{exchange.skillName}</span>
                        </>
                      )}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>with</span>
                      <span className="font-medium text-foreground">
                        {exchange.otherUser.name}
                      </span>
                      <span className="text-border">•</span>
                      <span>{new Date(exchange.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 min-w-0">
                    {exchange.status === "active" && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                        <Link
                          to={`/messages?match=${exchange.otherUser.id}`}
                          className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-6 py-3 w-full sm:w-auto justify-center rounded-xl font-medium shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            Message
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                        <button
                          onClick={() => handleComplete(exchange.id)}
                          className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm px-6 py-3 w-full sm:w-auto justify-center rounded-xl font-medium shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Complete
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    )}
                    {exchange.status === "completed" && (
                      <div className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform transition-all duration-300 hover:scale-105 inline-flex items-center gap-2">
                        <span className="relative z-10 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Exchange completed!
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </div>
                    )}
                    {exchange.status === "pending" && (
                      <div className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform transition-all duration-300 hover:scale-105 inline-flex items-center gap-2">
                        <span className="relative z-10 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Waiting for acceptance
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
