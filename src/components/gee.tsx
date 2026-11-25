import { getEarthEngine } from "@/lib/earth-engine";
import MapComponent from "./openlayer";

const GoogleEarthEngine = async () => {
  try {
    const ee = await getEarthEngine();
    const image = ee.ImageCollection("IDAHO_EPSCOR/TERRACLIMATE")
      .filterDate("2020-01-01", "2020-01-31")
      .select("tmmx")
      .mean();
    const map = await new Promise<{ urlFormat: string }>((resolve, reject) => {
      image.getMap(
        { min: 0, max: 0.9, palette: ["blue", "green", "red"] },
        (result: { urlFormat?: string } | undefined, error: unknown) => {
          if (error || !result?.urlFormat) {
            reject(new Error("Earth Engine map generation failed"));
          } else {
            resolve({ urlFormat: result.urlFormat });
          }
        },
      );
    });
    return (
      <div className="bg-white">
        <h1 className="text-xl text-zinc-800">Google Earth Engine temperature data</h1>
        <div className="w-[80%] h-[80%] border border-zinc-800 m-20">
          <MapComponent mapUrl={map.urlFormat} />
        </div>
      </div>
    );
  } catch {
    return <p>Earth Engine is unavailable. Check the server configuration.</p>;
  }
};

export default GoogleEarthEngine;
