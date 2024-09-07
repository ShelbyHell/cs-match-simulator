import random

class Player:
    def __init__(self, name, skill):
        self.name = name
        self.skill = skill
        self.points = 0
        self.kills = 0
        self.assists = 0
        self.deaths = 0

    def update_kd(self):
        if self.deaths == 0:
            self.kd = self.kills
        else:
            self.kd = self.kills / self.deaths

class Team:
    def __init__(self, name, players):
        self.name = name
        self.players = players

def simulate_round(team1, team2):
    team1_score = sum([random.random() * player.skill for player in team1.players])
    team2_score = sum([random.random() * player.skill for player in team2.players])

    for player in team1.players:
        player.kills += random.randint(0, 2)
        player.assists += random.randint(0, 1)
        player.deaths += random.randint(0, 2)

    for player in team2.players:
        player.kills += random.randint(0, 2)
        player.assists += random.randint(0, 1)
        player.deaths += random.randint(0, 2)

    if team1_score > team2_score:
        winning_team = team1
    else:
        winning_team = team2

    mvp_player = max(winning_team.players, key=lambda player: random.random() * player.skill)
    return winning_team, mvp_player

def simulate_match(team1, team2, rounds=30):
    team1_wins = 0
    team2_wins = 0

    for _ in range(rounds):
        winner, mvp_player = simulate_round(team1, team2)
        mvp_player.points += 1
        if winner == team1:
            team1_wins += 1
        else:
            team2_wins += 1

        if team1_wins >= 16:
            print(f"{team1.name} wins the match with score {team1_wins}:{team2_wins}")
            return team1, team1_wins, team2_wins
        elif team2_wins >= 16:
            print(f"{team2.name} wins the match with score {team2_wins}:{team1_wins}")
            return team2, team1_wins, team2_wins

    if team1_wins == team2_wins:
        print(f"Match tied at {team1_wins}:{team2_wins}, entering overtime...")
        winner, final_team1_wins, final_team2_wins = simulate_overtime(team1, team2, team1_wins, team2_wins)
        return winner, final_team1_wins, final_team2_wins
    else:
        if team1_wins > team2_wins:
            print(f"{team1.name} wins the match with score {team1_wins}:{team2_wins}")
            return team1, team1_wins, team2_wins
        else:
            print(f"{team2.name} wins the match with score {team2_wins}:{team1_wins}")
            return team2, team1_wins, team2_wins

def simulate_overtime(team1, team2, initial_team1_wins, initial_team2_wins, overtime_rounds=6):
    while True:
        team1_ot_wins = 0
        team2_ot_wins = 0

        for _ in range(overtime_rounds):
            winner, mvp_player = simulate_round(team1, team2)
            mvp_player.points += 1
            if winner == team1:
                team1_ot_wins += 1
            else:
                team2_ot_wins += 1

        print(f"Overtime score: {team1.name} {team1_ot_wins} - {team2.name} {team2_ot_wins}")

        if team1_ot_wins > team2_ot_wins:
            print(f"{team1.name} wins the match with overtime score {initial_team1_wins + team1_ot_wins}:{initial_team2_wins + team2_ot_wins}")
            return team1, initial_team1_wins + team1_ot_wins, initial_team2_wins + team2_ot_wins
        elif team2_ot_wins > team1_ot_wins:
            print(f"{team2.name} wins the match with overtime score {initial_team2_wins + team2_ot_wins}:{initial_team1_wins + team1_ot_wins}")
            return team2, initial_team1_wins + team2_ot_wins, initial_team2_wins + team1_ot_wins
        else:
            print("Overtime tied, entering another overtime...")

def determine_mvp(team1, team2):
    all_players = team1.players + team2.players
    mvp = max(all_players, key=lambda player: player.points)
    return mvp

def print_player_stats(player):
    player.update_kd()
    print(f"{player.name} - Kills: {player.kills}, Assists: {player.assists}, Deaths: {player.deaths}, KD: {player.kd:.2f}")

def print_team_stats(team):
    print(f"Team {team.name} Stats:")
    for player in team.players:
        print_player_stats(player)

# Example usage:
team1 = Team("Team A", [Player("Player 1", 0.9), Player("Player 2", 0.8), Player("Player 3", 0.85), Player("Player 4", 0.87), Player("Player 5", 0.88)])
team2 = Team("Team B", [Player("Player 6", 0.86), Player("Player 7", 0.84), Player("Player 8", 0.83), Player("Player 9", 0.9), Player("Player 10", 0.87)])

winner, team1_wins, team2_wins = simulate_match(team1, team2)
mvp = determine_mvp(team1, team2)
print(f"MVP of the match is {mvp.name} with {mvp.points} points")

print_team_stats(team1)
print_team_stats(team2)
