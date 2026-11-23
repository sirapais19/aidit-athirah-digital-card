export type DressCodeGroupId =
  | "couple"
  | "brideFamily"
  | "groomFamily"
  | "dulang"
  | "guests";

export type DressCodeGroup = {
  id: DressCodeGroupId;
  title: string;
  colours: string[];
  colourName: string;
  hexLabel: string;
};

export const dressCodeGroups: DressCodeGroup[] = [
  {
    id: "couple",
    title: "Pengantin",
    colours: ["#1F6F5C", "#C9A227"],
    colourName: "Emerald green & Gold",
    hexLabel: "#1F6F5C · #C9A227",
  },
  {
    id: "brideFamily",
    title: "Keluarga perempuan",
    colours: ["#F0E2CB"],
    colourName: "Cream champagne",
    hexLabel: "#F0E2CB",
  },
  {
    id: "groomFamily",
    title: "Keluarga lelaki",
    colours: ["#A9C7E3"],
    colourName: "Baby blue",
    hexLabel: "#A9C7E3",
  },
  {
    id: "dulang",
    title: "Dulang boy & girl",
    colours: ["#D8A7B1"],
    colourName: "Dusty pink",
    hexLabel: "#D8A7B1",
  },
  {
    id: "guests",
    title: "Tetamu",
    colours: ["#C97B5A", "#9CAF88", "#A98BA5", "#2F4156"],
    colourName: "Bebas — bukan putih",
    hexLabel: "BEBAS",
  },
];

export const dressCodeGuestNote =
  "Tetamu bebas pilih warna — kecuali putih dan warna keluarga di atas.";
