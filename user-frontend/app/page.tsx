import Image from "next/image";
import { Appbar } from "../components/Appbar";
import { Hero } from "../components/Hero";
import { Upload } from "../components/Upload";
import { UploadImage } from "../components/UploadImage";

export default function Home() {
  return (
    <main>
      <Appbar />
      <Hero />
      <Upload />
    </main>
  );
}
