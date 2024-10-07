
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { IndianRupee, UserRound } from "lucide-react";

function EventCard({ event }) {
  return (
    <Card className="w-96 min-h-80 md:transition-transform duration-300 ease-in-out hover:shadow-lg md:hover:scale-105 overflow-hidden rounded-xl shadow-md">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-5 left-5 bg-white rounded-md px-4 py-2 text-sm font-bold shadow-sm">
          {String(event.price) === '0' || event.price === '' ? (
              <>
              <div className="text-sm font-bold text-green-600">FREE</div>
              </>
            ) : (
              <>
                <IndianRupee className="inline-block w-3 h-3 mb-0.5" strokeWidth={3} />
                {event.price}
              </>
            )}
          </div>
          <div className="absolute flex top-5 right-5 backdrop-blur-sm bg-gray-900 bg-opacity-50 text-white rounded-md text-xs p-2">
            {event.participants.length}<UserRound className="h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <div className=" font-semibold text-center mr-1">
            <div className="text-sm text-purple-600 leading-none"> {new Date(event.startDate).toLocaleString('en-US', {
                month: 'short',
              })}</div>
            <div className="text-2xl leading-none mt-2 font-bold "> {new Date(event.startDate).toLocaleString('en-US', {
                day: 'numeric',
              })}</div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{event.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 leading-snug">{event.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventCard
