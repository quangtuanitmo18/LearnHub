import re

with open('src/modules/quiz-attempt/quiz-attempt.service.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r'if \(quiz\.isContest && expiresAt\) \{',
    r'if ((isContest || (quiz as any).isContest) && expiresAt) {',
    content
)

with open('src/modules/quiz-attempt/quiz-attempt.service.ts', 'w') as f:
    f.write(content)
