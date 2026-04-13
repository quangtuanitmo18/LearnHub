import re

with open('src/modules/quiz-attempt/quiz-attempt.service.ts', 'r') as f:
    content = f.read()

# Fix 1: string | null to string | undefined
content = re.sub(
    r'lessonId: attempt\.lessonId,',
    r'lessonId: attempt.lessonId || undefined,',
    content
)
content = re.sub(
    r'contestId: attempt\.contestId,',
    r'contestId: attempt.contestId || undefined,',
    content
)
content = re.sub(
    r'lessonId: newAttempt\.lessonId,',
    r'lessonId: newAttempt.lessonId || undefined,',
    content
)
content = re.sub(
    r'contestId: newAttempt\.contestId,',
    r'contestId: newAttempt.contestId || undefined,',
    content
)
content = re.sub(
    r'lessonId: existingAttempt\.lessonId,',
    r'lessonId: existingAttempt.lessonId || undefined,',
    content
)

# Fix 2: roles include
content = re.sub(
    r'const user = await this\.prismaService\.user\.findUnique\(\{ where: \{ id: userId \} \}\);',
    r'const user = await this.prismaService.user.findUnique({ where: { id: userId }, include: { roles: true } });',
    content
)

with open('src/modules/quiz-attempt/quiz-attempt.service.ts', 'w') as f:
    f.write(content)

