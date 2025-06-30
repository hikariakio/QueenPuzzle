import itertools

def count_valid_permutations_n(n):
    def is_adjacent(p1, p2):
        return abs(p1[0] - p2[0]) <= 1 and abs(p1[1] - p2[1]) <= 1

    def is_valid_classic(perm):
        for i in range(n):
            for j in range(i + 1, n):
                if abs(i - j) == abs(perm[i] - perm[j]):
                    return False
        return True

    def is_valid_custom(perm):
        positions = [(i, perm[i]) for i in range(n)]
        for i in range(n):
            for j in range(i + 1, n):
                if is_adjacent(positions[i], positions[j]):
                    return False
        return True

    classic_count = 0
    custom_count = 0

    for perm in itertools.permutations(range(n)):
        if is_valid_classic(perm):
            classic_count += 1
        if is_valid_custom(perm):
            custom_count += 1

    return classic_count, custom_count

# Compute for n = 10
print(count_valid_permutations_n(10))
