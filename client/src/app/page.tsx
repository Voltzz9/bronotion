import { SessionWrapper } from './SessionProvider'
import HomePageContent from './HomePageContent'

export default function HomePage() {
  return (
    <SessionWrapper>
      <HomePageContent />
    </SessionWrapper>
  );
}