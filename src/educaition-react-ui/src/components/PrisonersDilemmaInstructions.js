import { Typography, Container } from "@mui/material";

const PrisonersDilemmaInstructions = () => {
  return (
    <Container style={{ marginTop: "100px" }}>
      <Typography variant="h4" gutterBottom={true}>
        Welcome to the Prisoner's Dilemma Game!
      </Typography>

      <Typography variant="body1" paragraph={true}>
        In this game, you and another player will repeatedly choose to either
        cooperate or defect. Your choices will affect both your outcomes and the
        other player's outcomes. Here's how you can define your tactic:
      </Typography>

      <Typography variant="h6" gutterBottom={true}>
        Understanding the Choices:
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <strong>1. Cooperate</strong>: If you choose to cooperate, you are
        trusting the other player and working together for a potentially better
        mutual outcome.
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <strong>2. Defect</strong>: If you choose to defect, you are acting in
        your own self-interest, which could lead to a better individual outcome
        but might hurt the other player.
      </Typography>

      <Typography variant="h6" gutterBottom={true}>
        Scoring System:
      </Typography>
      <Typography variant="body1" paragraph={true}>
        Each round, you and your opponent will receive points based on your
        choices. The payoffs for each possible combination of choices are as
        follows:
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <ul>
          <li>
            <strong>Both Cooperate</strong>: Both players receive 3 points.
          </li>
          <li>
            <strong>You Cooperate, Opponent Defects</strong>: You receive 0
            points (Sucker's payoff), and your opponent receives 5 points
            (Temptation).
          </li>
          <li>
            <strong>You Defect, Opponent Cooperates</strong>: You receive 5
            points (Temptation), and your opponent receives 0 points (Sucker's
            payoff).
          </li>
          <li>
            <strong>Both Defect</strong>: Both players receive 1 point
            (Punishment).
          </li>
        </ul>
      </Typography>
      <Typography variant="body1" paragraph={true}>
        The goal is to maximize your points over multiple rounds and finish at
        the top of the leaderboard.
      </Typography>

      <Typography variant="h6" gutterBottom={true}>
        Your Task:
      </Typography>
      <Typography variant="body1" paragraph={true}>
        We need you to describe the strategy or tactic you would like to use in
        the game. This tactic will be used to determine your next move based on
        the previous rounds of the game.
      </Typography>

      <Typography variant="h6" gutterBottom={true}>
        How to Describe Your Tactic:
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <strong>1. Be Specific</strong>: Clearly state when you would choose to
        cooperate and when you would choose to defect. For example, you might
        want to cooperate if both players cooperated in the last round, or
        defect if the opponent defected last time.
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <strong>2. Consider Different Scenarios:</strong>
      </Typography>
      <Typography variant="body1" paragraph={true}>
        - What will you do if both you and the opponent cooperated in the last
        round?
      </Typography>
      <Typography variant="body1" paragraph={true}>
        - What will you do if you cooperated and the opponent defected?
      </Typography>
      <Typography variant="body1" paragraph={true}>
        - What will you do if you defected and the opponent cooperated?
      </Typography>
      <Typography variant="body1" paragraph={true}>
        - What will you do if both you and the opponent defected?
      </Typography>

      <Typography variant="body1" paragraph={true}>
        <strong>3. Think About Patterns:</strong> You can also think about
        patterns over several rounds. For example, you might cooperate if the
        opponent has cooperated for the last three rounds, or defect if they
        have defected two times in a row.
      </Typography>

      <Typography variant="h6" gutterBottom={true}>
        Example Tactics:
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <strong>Always Cooperate</strong>: Always choose to cooperate,
        regardless of the opponent's previous moves.
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <strong>Always Defect</strong>: Always choose to defect, regardless of
        the opponent's previous moves.
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <strong>Tit for Tat</strong>: Start by cooperating, then in each
        subsequent round, do whatever the opponent did in the previous round.
      </Typography>
      <Typography variant="body1" paragraph={true}>
        <strong>Grim Trigger</strong>: Start by cooperating, but if the opponent
        ever defects, defect for the rest of the game.
      </Typography>

      <Typography variant="h6" gutterBottom={true}>
        Your Tactic:
      </Typography>
      <Typography variant="body1" paragraph={true}>
        Now it's your turn! Describe your tactic in detail. Remember, the more
        specific you are, the better your strategy will be implemented in the
        game.
      </Typography>

      <Typography variant="h6" gutterBottom={true}>
        Leaderboard:
      </Typography>
      <Typography variant="body1" paragraph={true}>
        At the end of the game, your total points will determine your position
        on the leaderboard. Aim to develop a strategy that maximizes your points
        and helps you climb to the top!
      </Typography>

      <Typography variant="body1" paragraph={true}>
        Feel free to ask if you need more information or have any questions!
      </Typography>
    </Container>
  );
};

export default PrisonersDilemmaInstructions;
