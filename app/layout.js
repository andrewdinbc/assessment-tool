import DevModePanel from '../developer-mode/DevModePanel'

export const metadata = { title:"assessment-tool", description:"K–8 norm-referenced placement tool using PIRLS, TIMSS, PCAP, and provincial benchmarks as open-source norm anchors." };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <DevModePanel
          productName="Assessment Tool"
          sourceRepo="andrewdinbc/assessment-tool"
          userEmail="andrewsinbc3@gmail.com"
          userKey="owner"
          morpheusUrl="https://morpheus-scheduler.vercel.app"
          enabled={true}
          audienceLabel="a K-8 teacher reviewing AI-graded student assessments and class-level analytics (not a student-facing product)"
          mode="personal"
        />
      </body>
    </html>
  );
}
