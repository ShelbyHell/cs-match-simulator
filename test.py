import random

class Player:
    def __init__(self, name, skill):
        self.name = name
        self.skill = skill

class Team:
    def __init__(self, name, players):
        self.name = name
        self.players = players

def simulate_round(team1, team2):
    team1_score = sum([random.random() * player.skill for player in team1.players])
    team2_score = sum([random.random() * player.skill for player in team2.players])
    if team1_score > team2_score:
        return team1
    else:
        return team2

def simulate_match(team1, team2, rounds=30):
    team1_wins = 0
    team2_wins = 0

    for _ in range(rounds):
        winner = simulate_round(team1, team2)
        if winner == team1:
            team1_wins += 1
        else:
            team2_wins += 1

        # Check if a team has already won 16 rounds
        if team1_wins >= 13:
            print(f"{team1.name} wins the match with score {team1_wins}:{team2_wins}")
            return team1
        elif team2_wins >= 13:
            print(f"{team2.name} wins the match with score {team2_wins}:{team1_wins}")
            return team2

    # If no team won 16 rounds, determine winner by most rounds won
    if team1_wins > team2_wins:
        print(f"{team1.name} wins the match with score {team1_wins}:{team2_wins}")
        return team1
    else:
        print(f"{team2.name} wins the match with score {team2_wins}:{team1_wins}")
        return team2

# Example usage:
team1 = Team("Team A", [Player("Player 1", 0.9), Player("Player 2", 0.8), Player("Player 3", 0.85), Player("Player 4", 0.87), Player("Player 5", 0.88)])
team2 = Team("Team B", [Player("Player 6", 0.86), Player("Player 7", 0.84), Player("Player 8", 0.83), Player("Player 9", 0.9), Player("Player 10", 0.87)])

simulate_match(team1, team2)
