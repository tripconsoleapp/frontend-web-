"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";
import { formatCurrency, formatDateRange } from "@/lib/mock-trips";
import { Template } from "@/lib/mock-templates";
import { PilgrimageDeparture } from "@/lib/pilgrimage-departures";
import { DepartureBooking, getActiveBooking, getBooking } from "@/lib/pilgrimage-booking";

export function BookingReceiptView({
  departure,
  template,
  bookingId,
}: {
  departure: PilgrimageDeparture;
  template: Template;
  bookingId?: string;
}) {
  const router = useRouter();
  const detailHref = `/pilgrimage/scheduled/${departure.id}`;
  const [booking, setBooking] = useState<DepartureBooking | null>(null);

  useEffect(() => {
    const active = (bookingId ? getBooking(bookingId) : null) ?? getActiveBooking(departure.id);
    if (!active || active.reservationStatus !== "confirmed") {
      router.replace(detailHref);
      return;
    }
    setBooking(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booking) return <div className="h-64" />;

  const succeeded = booking.paymentAttempts.filter((a) => a.status === "succeeded");
  const payment = succeeded[succeeded.length - 1] ?? null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <Link
        href={`${detailHref}/confirmed?booking=${booking.id}`}
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} /> Back to Trip
      </Link>

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        <div className="flex items-center gap-2 bg-navy px-6 py-4">
          <Landmark size={16} className="text-mint" />
          <p className="font-heading text-sm font-semibold text-white">Payment Receipt</p>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div>
            <p className="font-body text-xs uppercase tracking-wide text-text-grey">Receipt For</p>
            <p className="font-heading text-base font-semibold text-navy">{departure.title}</p>
            <p className="font-body text-xs text-text-grey">
              {formatDateRange(departure.departureDate, departure.returnDate)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-dashed border-navy/15 pt-4 font-body text-sm">
            <div>
              <p className="text-xs text-text-grey">Booking Reference</p>
              <p className="font-semibold text-navy">{booking.bookingReference}</p>
            </div>
            <div>
              <p className="text-xs text-text-grey">Transaction ID</p>
              <p className="font-semibold text-navy">{payment?.transactionId ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-text-grey">Payment Method</p>
              <p className="font-semibold text-navy">{payment?.methodLabel ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-text-grey">Date</p>
              <p className="font-semibold text-navy">
                {payment ? new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-grey">Passengers</p>
              <p className="font-semibold text-navy">{booking.participantCount}</p>
            </div>
            <div>
              <p className="text-xs text-text-grey">Amount Paid</p>
              <p className="font-semibold text-navy">{formatCurrency(payment?.amount ?? booking.amount)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-navy/15 pt-4">
            <span className="font-body text-sm font-semibold text-navy">Total Paid</span>
            <span className="font-heading text-xl font-bold text-navy">{formatCurrency(payment?.amount ?? booking.amount)}</span>
          </div>
        </div>
      </div>

      <p className="text-center font-body text-xs text-text-grey">
        This receipt confirms payment for the departure above. For questions,
        contact support@tripconsole.in.
      </p>
    </div>
  );
}
