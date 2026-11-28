// ============================================================
//  UBAH DETAILS WEDDING TIMELINE DI SINI
// ------------------------------------------------------------
//  time   : masa mula event, contoh "11:00"
//  timeEnd: (optional) masa tamat, contoh "10:00" — kalau ada,
//           masa akan disusun bertindih (mula di atas, tamat di bawah)
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
  timeEnd?: string;
  period: "AM" | "PM";
  title: string;
  detail: string;
  gate: string;
  seat: string;
};

export const timelineFlightCode = "AA241226";


export const weddingTimelineEvents: WeddingTimelineEvent[] = [
  {
    time: "9:00",
    timeEnd: "10:00",
    period: "AM",
    title: "Akad Nikah Ceremony",
    detail: "A private ceremony exclusively for immediate family.",
    gate: "Moara Hall",
    seat: "Family Only",
  },
  {
    time: "12:00",
    period: "PM",
    title: "Bride & Groom Arrival",
    detail: "The newlyweds arrive with a traditional wedding procession (Berarak), followed by a prayer.",
    gate: "Main Entrance",
    seat: "All Guests",
  },
  {
    time: "12:30",
    period: "PM",
    title: "Guest Arrival",
    detail: "Guests are welcome to arrive, register, and get seated before the celebration begins.",
    gate: "Moara Hall",
    seat: "All Guests",
  },
 
  {
    time: "12:45",
    period: "PM",
    title: "Family Portrait Session",
    detail: "Photographs with parents, siblings and the extended families of both sides.",
    gate: "Photo Area",
    seat: "Family",
  },
  {
    time: "1:15",
    period: "PM",
    title: "Lunch Reception",
    detail: "Guests are invited to enjoy the meal that has been prepared.",
    gate: "Dining Hall",
    seat: "All Guests",
  },
  {
    time: "1:45",
    period: "PM",
    title: "Free & Easy Session",
    detail: "Mingle, take photos and spend time with the newlyweds and other guests.",
    gate: "Main Hall",
    seat: "All Guests",
  },
  {
    time: "4:30",
    period: "PM",
    title: "Reception Ends",
    detail: "Thank you for your presence and prayers. Safe travels home.",
    gate: "Moara Hall",
    seat: "Forever",
  },
];

