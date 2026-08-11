export default function AppPromoSection() {
  return (
    <section>
      <div
        className="grid sm:grid-cols-2 items-center gap-8 px-8 sm:px-12 py-10"
        style={{ backgroundColor: "#DFEFFF", borderRadius: "20px" }}
      >
        <div>
          <p className="font-semibold" style={{ color: "#0A31A1" }}>
            CSB IAS ACADEMY
          </p>
          <h2 className="font-bold mt-2 leading-tight" style={{ color: "#0A31A1", fontSize: "48px" }}>
            Online learning now in your fingertips
          </h2>
          <div className="flex gap-3 mt-6">
            <a href="https://apps.apple.com/in/app/myinstitute/id1472483563" target="_blank" rel="noopener noreferrer">
              <img src="/app-store.svg" alt="Download on the App Store" className="h-11" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=co.thanos.vrdlc&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/google-play.svg" alt="Get it on Google Play" className="h-11" />
            </a>
          </div>
        </div>
        <div className="flex justify-center">
          <img src="/mobile-app-mockup.png" alt="CSB IAS Academy mobile app" className="max-w-[260px] w-full" />
        </div>
      </div>
    </section>
  );
}
