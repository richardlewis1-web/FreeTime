import { TriviaGame } from "@/components/trivia-game";
import { getQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const questions = await getQuestions();

  return <TriviaGame questions={questions} />;
}
