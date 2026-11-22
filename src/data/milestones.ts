import moment1 from "@/assets/moment-1.jpeg";
import moment2 from "@/assets/moment-2.jpeg";
import moment3 from "@/assets/moment-3.jpeg";
import moment4 from "@/assets/moment-4.jpeg";
import moment5 from "@/assets/moment-5.jpeg";
import moment6 from "@/assets/moment-6.jpeg";
import moment7 from "@/assets/moment-7.jpeg";
import moment8 from "@/assets/moment-8.jpeg";
import moment9 from "@/assets/moment-9.jpeg";
import moment10 from "@/assets/moment-10.jpeg";
import moment11 from "@/assets/moment-11.jpeg";
import moment12 from "@/assets/moment-12.jpeg";
import moment13 from "@/assets/moment-13.jpeg";
import moment13b from "@/assets/moment-13b.jpeg";
import moment13c from "@/assets/moment-13c.jpeg";
import moment13d from "@/assets/moment-13d.jpeg";
import moment13e from "@/assets/moment-13e.jpeg";
import moment13f from "@/assets/moment-13f.jpeg";
import moment13g from "@/assets/moment-13g.jpeg";
import moment14 from "@/assets/moment-14.jpeg";

export type Milestone = {
  date: string;
  title: string;
  note: string;
  /** Satu gambar */
  image?: string;
  /** Beberapa gambar — akan jadi carousel swipe */
  images?: string[];
  /** CSS object-position untuk gambar portrait (default: tengah) */
  focus?: string;
};

export const milestones: Milestone[] = [
  {
    date: "2021-Zaman Discord",
    title: "How We Met",
    note: "Semuanya bermula dalam group chat yang sama. Masa tu, kami cuma kawan yang suka borak, bergurau dan menghabiskan malam bersama. Discord menjadi rutin harian, bangun tidur cari Discord, sebelum tidur pun singgah Discord. Di antara ramai orang yang ditemui, tak pernah terfikir perkenalan biasa ini akan menjadi permulaan kepada sebuah cerita yang begitu istimewa.",
    image: moment1,
  },
  {
    date: "Oktober 2022",
    title: "From Online to Offline",
    note: "Selepas setahun berkenalan melalui Discord, akhirnya kami semua berpeluang berjumpa buat pertama kali. Daripada sekadar berborak di sebalik skrin, kini dapat berkumpul dan meluangkan masa bersama. Pada mulanya, kami cuma sekumpulan kawan yang berkongsi gelak tawa, aktiviti dan kenangan tanpa sebarang perancangan. Kami hanya menikmati setiap detik bersama, tanpa mengetahui apa yang bakal menanti di kemudian hari.",
    image: moment2,
  },
  {
    date: "Januari 2023",
    title: "Little Moments, Big Memories",
    note: "Dari gelanggang ke gelak tawa, dari aktiviti biasa menjadi kenangan luar biasa. Mungkin ketika itu kita cuma menikmati masa bersama, tetapi hari ini, setiap momen kecil itulah yang paling berharga untuk dikenang",
    image: moment3,
  },
  {
    date: "Februari 2023",
    title: "The Adventures We Shared",
    note: "Dari sekadar merancang untuk keluar bersama, akhirnya kami sampai juga ke puncak. Ada penat, gelak tawa, usikan dan macam-macam cerita sepanjang perjalanan. Bukan tentang siapa paling cepat sampai, tetapi tentang pengalaman yang dikongsi dan kenangan yang tercipta bersama.",
    image: moment4,
  },
  {
    date: "Februari 2023",
    title: "More Memories to Come",
    note: "Waktu ni, ke mana-mana pun kami selalu bergerak bersama sebagai satu kumpulan. Ada masa keluar makan, tengok wayang, berjalan ke Kuantan dan macam-macam. Tak perlu rancangan, asalkan dapat berkumpul dan meluangkan masa bersama. Setiap kali keluar, pasti ada cerita, gelak tawa dan kenangan tersendiri. Mungkin nampak seperti hari-hari biasa, tetapi itulah antara momen yang paling seronok untuk dikenang.",
    image: moment5,
  },
  {
    date: "2023",
    title: "Where It All Started",
    note: "Awalnya cuma usikan kawan-kawan yang suruh kami bergambar di hadapan signboard FK, kononnya untuk ditunjukkan kepada anak-anak nanti. Baju yang sering sedondon pun makin jadi bahan usikan. Ketika itu kami cuma ketawa tak sangka gambar ini rupanya permulaan cerita kami.",
    image: moment6,
  },
  {
    date: "2023",
    title: "The Photo That Went Viral",
    note: "Makin lama, kami makin rapat duduk sebelah, jalan sama-sama, semua orang dah perasan walaupun kami cuba sorok. Sampailah suatu hari, kawan sempat curi gambar kami berdua dan terus viralkan dalam group. Dari situ barulah semua orang “sahkan” yang kami ni ada something, dan cerita kami mula jadi rasmi.",
    image: moment7,
  },
  {
    date: "2023",
    title: "Flowers and Night Walks",
    note: "Ada suatu malam, ketika kami berjalan-jalan di art street Kuatan, Aidit tiba tiba membelikan bunga kepada Athirah. Mungkin nampak seperti hadiah biasa, tetapi sebenarnya ia cukup istimewa kerana itulah kali pertama Aidit membelikan bunga untuk seorang perempuan. Satu perkara kecil yang mungkin nampak sederhana, tetapi menjadi kenangan manis yang akan sentiasa diingati. Siapa sangka, bunga pertama itu menjadi salah satu momen istimewa dalam perjalanan cerita kami.",
    image: moment8,
  },
  {
    date: "2024",
    title: "Meet Aidit's Family",
    note: "Kali pertama Athirah berpeluang berjumpa dengan keluarga Aidit. Mestilah ada rasa cuak dan berdebar sebelum bertemu, tertanya-tanya bagaimana penerimaan mereka nanti. Namun, sambutan yang mesra dan layanan yang baik membuatkan rasa kekok itu perlahan-lahan hilang. Dari pertemuan pertama itulah Athirah mula mengenali keluarga Aidit dengan lebih dekat dan mencipta kenangan bersama mereka.",
    image: moment9,
  },
  {
    date: "2025",
    title: "Final Year, Same Team",
    note: "Semester terakhir dengan projek FYP menjadi penutup kepada perjalanan degree kami. Dari hari pertama pengajian, banyak perkara yang kami lalui bersama, daripada menghadiri kelas, menyiapkan tugasan, belajar untuk peperiksaan hinggalah saling membantu menyiapkan projek akhir. Ada masa penat dan stres, tetapi kami sentiasa memberi semangat antara satu sama lain. Akhirnya, kami berdiri bersama di hadapan banner pada hari pembentangan, sebagai kenangan kepada perjalanan panjang yang berjaya ditempuhi bersama.",
    image: moment10,
  },
  {
    date: "2025",
    title: "Graduation Day",
    note: "Hari yang dinanti-nantikan sejak tahun pertama akhirnya tiba selepas empat tahun menempuh alam pengajian. Dengan jubah konvokesyen dan senyuman penuh kegembiraan, kami meraikan kejayaan menamatkan pengajian. Bukan sekadar bangga kerana berjaya memperoleh segulung ijazah, tetapi lebih bermakna kerana dapat melalui segala cabaran dan sampai ke garisan penamat bersama-sama walaupun banyak cabaran.",
    image: moment11,
  },
  {
    date: "2025",
    title: "One Big Family",
    note: "Hari konvokesyen bukan sekadar meraikan kejayaan kami menamatkan pengajian, tetapi juga menjadi momen bermakna apabila kedua-dua keluarga mula berkumpul dan berkenalan dengan lebih dekat. Daripada pertemuan pertama itu, hubungan antara keluarga semakin erat. Sedikit demi sedikit, perbualan mula beralih kepada perancangan masa depan dan langkah seterusnya untuk kami berdua. Rupanya, perjalanan ini bukan lagi tentang kami berdua sahaja, tetapi tentang dua keluarga yang mula disatukan.",
    image: moment12,
    focus: "50% 10%",
  },
  {
    date: "30 Mei 2026",
    title: "The Promise",
    note: "Dengan cincin di jari dan restu keluarga, kami mengikat janji untuk melangkah ke fasa seterusnya. Majlis sarung cincin di rumah berlangsung secara sederhana tetapi meriah dengan kehadiran kedua-dua keluarga. Walaupun masing-masing berasa gementar, semuanya terasa lebih tenang dengan kehadiran insan tersayang. Saat cincin disarungkan, kami sedar bahawa perjalanan ini bukan lagi tentang kami berdua sahaja, tetapi juga tentang dua keluarga yang semakin rapat dan sama-sama mendoakan kebahagiaan kami.",
    images: [moment13, moment13b, moment13c, moment13d, moment13e, moment13f, moment13g],
  },
  {
    date: "A Little Throwback",
    title: "The Little Kids Are Getting Married",
    note: "Dua budak kecil dalam gambar ini tak pernah menyangka bahawa suatu hari nanti mereka akan bertemu dan memilih untuk bersama. Siapa sangka, selepas bertahun-tahun membesar dan melalui perjalanan hidup masing-masing, kini mereka bakal melangkah ke alam perkahwinan. Daripada zaman kecil yang penuh dengan gelak tawa dan permainan, kini tiba masanya untuk mencipta kenangan baharu bersama sebagai suami isteri.",
    image: moment14,
    focus: "50% 20%",
  },
];
