import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trophy } from 'lucide-react';
import SelectorPrac from './SelectorPrac';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { DialogDescription } from '@radix-ui/react-dialog';
import { baseUrl } from '@/common/common';
import ParticipantsSelector from './ParticipantsSelector';

export function WinnerDeclarationPopup({ event }) {
  const { handleSubmit, watch, setValue, reset } = useForm();
  const [loading, setLoading] = useState(false);

  // Watch the selected winners
  const winner1 = watch("winner1");
  const winner2 = watch("winner2");
  const winner3 = watch("winner3");

  const formSubmit = async () => {
    setLoading(true);

    // Prepare the winners array for the backend
    const winners = [
      { user: winner1?.[0]?._id, position: "1" },
      { user: winner2?.[0]?._id, position: "2" },
      { user: winner3?.[0]?._id, position: "3" },
    ].filter(winner => winner.user); // Filter out any undefined or empty selections

    try {
      const response = await axios.post(
        `${baseUrl}/api/winners/add/${event._id}`, // Adjusted to match backend route
        {
          winners,
          showWinners: true, // Optional: Include if visibility is being toggled
        }
      );

      toast.success("Winners updated successfully!");
      reset();
    } catch (err) {
      toast.error("Failed to update winners: " + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex sm:mr-5 border-gray-100 border-2 items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          {event.winners?.length > 0 ? "Update Winners" : "Declare Winners"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Declare Winners</DialogTitle>
        </DialogHeader>
        <DialogDescription className="bg-gradient-to-b font-semibold from-purple-700 to-pink-500 bg-clip-text text-transparent">
          {event.title}
        </DialogDescription>
        <form onSubmit={handleSubmit(formSubmit)}>
          <div className="grid gap-4 py-4">
            <div>
              <Label>First</Label>
              <ParticipantsSelector selector={"winner1"} setValue={setValue} eventId={event._id} />
            </div>
            <div>
              <Label>Second</Label>
              <ParticipantsSelector selector={"winner2"} setValue={setValue} eventId={event._id}  />
            </div>
            <div>
              <Label>Third</Label>
              <ParticipantsSelector selector={"winner3"} setValue={setValue} eventId={event._id}  />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-gray-950 text-white" disabled={loading}>
              {loading ? "Submitting..." : "Submit Winners"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
