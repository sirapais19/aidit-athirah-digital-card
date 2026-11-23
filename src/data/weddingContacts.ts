export type WeddingContact = {
  side: "Bride" | "Groom";
  name: string;
  phone: string;
  displayPhone: string;
};

export const weddingContacts: WeddingContact[] = [
  {
    side: "Bride",
    name: "Athirah",
    phone: "+60189067988",
    displayPhone: "018-906 7988",
  },
  {
    side: "Groom",
    name: "Aidit",
    phone: "+60133694584",
    displayPhone: "013-369 4584",
  },
];
