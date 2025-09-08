import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, HelpCircle } from "lucide-react";

const Support = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [form, setForm] = useState({ subject: "", message: "", email: user?.email || "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/projects/faqs")
      .then(res => res.json())
      .then(data => setFaqs(data.faqs || []))
      .catch(() => setFaqs([]))
      .finally(() => setLoadingFaqs(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/projects/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to submit support request");
      setSuccess("Support request submitted! We'll get back to you soon.");
      setForm({ ...form, subject: "", message: "" });
    } catch {
      setError("Failed to submit support request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-teal-100">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/help and support.png" alt="Help and Support background" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-blue-100/60 to-teal-100/80 backdrop-blur-md" />
      </div>
      {/* Foreground content */}
      <div className="relative z-10 w-full max-w-2xl py-12 px-2">
        <div className="flex justify-end items-center mb-6">
          <Link to="/business-dashboard" className="inline-flex items-center gap-2 text-sm font-medium rounded-lg bg-gradient-to-r from-teal-600 via-emerald-500 to-orange-500 text-white shadow-lg hover:from-teal-700 hover:via-emerald-600 hover:to-orange-600 hover:shadow-xl hover:scale-105 transition-all duration-300 transform px-3 py-1.5 border-0">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        <Card className="mb-10 rounded-2xl shadow-2xl bg-white/80 backdrop-blur-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-teal-700"><HelpCircle className="w-6 h-6 text-teal-400" /> Support</CardTitle>
            <CardDescription className="text-gray-600">If you have any questions or need assistance, please don't hesitate to contact us.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-10">
              <h3 className="font-semibold mb-4 text-lg text-gray-800 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-400" /> Frequently Asked Questions</h3>
              {loadingFaqs ? (
                <div className="text-gray-400">Loading FAQs...</div>
              ) : faqs.length === 0 ? (
                <div className="text-gray-400">No FAQs available.</div>
              ) : (
                <ul className="space-y-4">
                  {faqs.map((faq, i) => (
                    <li key={i} className="bg-blue-50/60 rounded-lg p-4 shadow-sm">
                      <div className="font-medium text-teal-800 mb-1 flex items-center gap-2">Q: {faq.q}</div>
                      <div className="text-gray-700 ml-2">A: {faq.a}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-10">
              <h3 className="font-semibold mb-4 text-lg text-gray-800 flex items-center gap-2"><Mail className="w-5 h-5 text-emerald-400" /> Contact Support</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-teal-200 bg-white/80"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    disabled={!!user?.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Subject</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-teal-200 bg-white/80"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Message</label>
                  <textarea
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 bg-white/80"
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-lg font-bold shadow-md py-3">
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
                {success && <div className="text-green-600 mt-2 font-semibold text-center">{success}</div>}
                {error && <div className="text-red-600 mt-2 font-semibold text-center">{error}</div>}
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support; 