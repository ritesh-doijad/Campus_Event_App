import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import EventTickets from "@/components/eventTicket";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

export default function Component() {
  const user = useSelector((state) => state.auth?.userInfo?.myevents);
  const myActiveTickets = useSelector((state) => state.event?.events);
  
  const [loading, setLoading] = useState(true); // Loading state
  const [statusFilter, setStatusFilter] = useState("Confirmed");
  const [previousFilter, setPreviousFilter] = useState(statusFilter);
  const [slideDirection, setSlideDirection] = useState("");
  const [isSliding, setIsSliding] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && myActiveTickets) {
      setLoading(true);
      const combinedDetails = user.map((paymentEvent) => {
        const matchedEvent = myActiveTickets.find(
          (activeEvent) => activeEvent._id === paymentEvent.eventId
        );
        if (matchedEvent) {
          return {
            ...matchedEvent,
            paymentStatus: paymentEvent?.paymentStatus,
            paymentScreenshot: paymentEvent.paymentScreenshot,
          };
        }
        return null;
      }).filter(event => event !== null);
      setAllEvents(combinedDetails);
      setDisplayedEvents(
        allEvents.filter(event => 
          event.paymentStatus === statusFilter && 
          !(statusFilter === "Confirmed" && event.isCertificateEnabled === true)
        )
      );
      
      setLoading(false);
    }
  }, [user, myActiveTickets]);

  useEffect(() => {
    if (previousFilter !== statusFilter) {
      const direction =
        (previousFilter === "Rejected" && statusFilter === "Confirmed")
          ? "left"
          : (previousFilter === "Confirmed" && (statusFilter === "Pending" || statusFilter === "Rejected")) ||
            (previousFilter === "Pending" && statusFilter === "Rejected")
          ? "right"
          : "left";

      setSlideDirection(direction);
      setIsSliding(true);

      setTimeout(() => {
        setDisplayedEvents(
          allEvents.filter(event => 
            event.paymentStatus === statusFilter && 
            !(statusFilter === "Confirmed" && event.isCertificateEnabled === true)
          )
        ); 
        setIsSliding(false);
        setPreviousFilter(statusFilter);
      }, 100);
    }
  }, [statusFilter, previousFilter, allEvents]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 md:mb-8 text-gray-800">My Tickets</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search tickets..." className="pl-10 bg-white border-gray-200" />
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <Select>
                <SelectTrigger className="w-[180px] bg-white border-gray-200">
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="bg-white" value="date-asc">Date (Ascending)</SelectItem>
                  <SelectItem className="bg-white" value="date-desc">Date (Descending)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3 md:mb-6">
            {["Confirmed", "Pending", "Rejected"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                className={`${
                  statusFilter === status
                    ? "bg-gray-900 text-white "
                    : "bg-background text-foreground transition-colors hover:bg-gray-100"
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-lg text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div
            className={`space-y-4 md:space-y-6 transition-transform duration-500 ${
              isSliding
                ? slideDirection === "left"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {displayedEvents.length > 0 ? (
              displayedEvents.map((event) => <EventTickets key={event._id} event={event} />)
            ) : (
              <div className='md-max-h-screen w-full flex justify-center text-center items-center'>
                <p>
                  <span className='font-medium md:text-7xl text-3xl'>
                    Nothing Here!<br />
                    <span className="md:text-4xl text-2xl">How about participating in an event</span>
                    <br />
                  </span>
                  <span className='text-gray-900 font-light'>
                    <br />
                    <Button
                      variant="default"
                      className="mt-4 bg-indigo-200 text-gray-700"
                      onClick={() => navigate("/")}
                    >
                      Browse Events
                    </Button>
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
