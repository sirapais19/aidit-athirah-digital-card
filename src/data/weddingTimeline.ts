// ============================================================
//  UBAH DETAILS WEDDING TIMELINE DI SINI
// ------------------------------------------------------------
//  time   : masa event, contoh "11:00"
//  period : "AM" atau "PM"
//  title  : tajuk event
//  detail : ayat kecil di bawah tajuk
//  gate   : lokasi / gate
//  seat   : untuk siapa / seat
//
//  Nak tambah event baru? Copy satu block { ... } di bawah
//  dan letak dalam array weddingTimelineEvents.
// ============================================================

export type WeddingTimelineEvent = {
  time: string;
  period: "AM" | "PM";
  title: string;
  detail: string;
  gate: string;
  seat: string;
};

export const timelineFlightCode = "AA 1224";


export const weddingTimelineEvents: WeddingTimelineEvent[] = [
  {
    time: "9:30",
    period: "AM",
    title: "Akad Nikah Ceremony",
    detail: "The solemnisation ceremony of Athirah & Aidit. A private ceremony exclusively for immediate family.",
    gate: "Moara Hall",
    seat: "Family Only",
  },
  {
    time: "11:00",
    period: "AM",
    title: "Guest Arrival",
    detail: "Guests are welcome to arrive, register, and get seated before the reception begins.",
    gate: "Moara Hall",
    seat: "All Guests",
  },
  {
    time: "12:30",
    period: "PM",
    title: "Bride & Groom Arrival",
    detail: "The newlyweds arrive with a traditional wedding procession (Berarak) to celebrate their special day.",
    gate: "Main Entrance",
    seat: "All Guests",
  },
  {
    time: "12:30",
    period: "PM",
    title: "Wedding Reception & Lunch",
    detail: "Enjoy a delightful lunch, greetings, and a joyful celebration with the newlyweds.",
    gate: "Main Hall",
    seat: "All Guests",
  },
  {
    time: "2:30",
    period: "PM",
    title: "Photography Session",
    detail: "Capture beautiful memories with the bride and groom through family and group photographs.",
    gate: "Garden",
    seat: "Family & Friends",
  },
  {
    time: "4:00",
    period: "PM",
    title: "Reception Ends",
    detail: "Thank you for being part of our special day. Your presence means the world to us as we begin our forever journey.",
    gate: "Moara Hall",
    seat: "Forever",
  },
];

