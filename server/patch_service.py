import re

with open('src/modules/quiz-attempt/quiz-attempt.service.ts', 'r') as f:
    content = f.read()

# startOrResumeAttempt
content = re.sub(
    r'async startOrResumeAttempt\(\s*lessonId: string,\s*userId: string,\s*\): Promise<AttemptMetaResponseDto> \{',
    r'async startOrResumeAttempt(\n    referenceId: string,\n    userId: string,\n    isContest: boolean = false,\n  ): Promise<AttemptMetaResponseDto> {',
    content
)

content = re.sub(
    r'await this\.verifyCourseAccess\(userId, lessonId\);',
    r'if (!isContest) {\n      await this.verifyCourseAccess(userId, referenceId);\n    } else {\n      // Contest is public or requires membership. We can verify membership here.\n      const contest = await this.prismaService.contest.findUnique({ where: { id: referenceId } });\n      if (contest?.isMembership) {\n         const user = await this.prismaService.user.findUnique({ where: { id: userId } });\n         const hasMembership = user?.isMembership && user.planEndDate && new Date(user.planEndDate) > new Date();\n         if (!hasMembership && !user?.roles.some(r => r.name === "Admin" || r.name === "Super Admin")) {\n             throw new ForbiddenException("Membership is required for this contest");\n         }\n      }\n    }',
    content
)

content = re.sub(
    r'const quiz = await this\.quizAttemptRepository\.findQuizByLessonId\(lessonId\);',
    r'const quiz = isContest\n      ? await this.quizAttemptRepository.findContestById(referenceId)\n      : await this.quizAttemptRepository.findQuizByLessonId(referenceId);',
    content
)
content = re.sub(
    r'await this\.quizAttemptRepository\.findInProgressAttempt\(lessonId, userId\);',
    r'await this.quizAttemptRepository.findInProgressAttempt(referenceId, userId, isContest);',
    content
)
content = re.sub(
    r'await this\.quizAttemptRepository\.getUsedAttemptsCount\(lessonId, userId\);',
    r'await this.quizAttemptRepository.getUsedAttemptsCount(referenceId, userId, isContest);',
    content
)
content = re.sub(
    r'await this\.quizAttemptRepository\.getNextAttemptNo\(\s*lessonId,\s*userId,\s*\);',
    r'await this.quizAttemptRepository.getNextAttemptNo(\n      referenceId,\n      userId,\n      isContest,\n    );',
    content
)

content = re.sub(
    r'const newAttempt = await this\.quizAttemptRepository\.createAttempt\({\s*lessonId,\s*userId,\s*attemptNo,\s*expiresAt,\s*}\);',
    r'const newAttempt = await this.quizAttemptRepository.createAttempt({\n      lessonId: isContest ? undefined : referenceId,\n      contestId: isContest ? referenceId : undefined,\n      userId,\n      attemptNo,\n      expiresAt,\n    });',
    content
)

# Fix isContest check inside startOrResumeAttempt where quiz doesn't have isContest
# Actually Contest does not have isContest. It has `startTime`, `endTime`, etc.
content = re.sub(
    r'if \(quiz\.isContest\) \{',
    r'if (isContest || (quiz as any).isContest) {',
    content
)
content = re.sub(
    r'if \(quiz\.isContest && quiz\.endTime\) \{',
    r'if ((isContest || (quiz as any).isContest) && quiz.endTime) {',
    content
)
content = re.sub(
    r'lessonId: newAttempt.lessonId,',
    r'lessonId: newAttempt.lessonId,\n      contestId: newAttempt.contestId,',
    content
)


# getAttemptContent
content = re.sub(
    r'const quiz = await this\.quizAttemptRepository\.findQuizByLessonId\(\s*attempt\.lessonId,\s*\);',
    r'const quiz = attempt.contestId\n      ? await this.quizAttemptRepository.findContestById(attempt.contestId)\n      : attempt.lessonId \n      ? await this.quizAttemptRepository.findQuizByLessonId(attempt.lessonId)\n      : null;',
    content
)

content = re.sub(
    r'lessonId: attempt.lessonId,',
    r'lessonId: attempt.lessonId,\n      contestId: attempt.contestId,',
    content
)


# submitAttempt
content = re.sub(
    r'const questions = await this\.quizAttemptRepository\.findQuestionsWithOptions\(\s*attempt\.lessonId,\s*\);',
    r'const questions = await this.quizAttemptRepository.findQuestionsWithOptions(\n      attempt.contestId || attempt.lessonId!,\n      !!attempt.contestId\n    );',
    content
)
content = re.sub(
    r'const quiz = await this\.quizAttemptRepository\.findQuizByLessonId\(\s*attempt\.lessonId,\s*\);',
    r'const quiz = attempt.contestId\n      ? await this.quizAttemptRepository.findContestById(attempt.contestId)\n      : attempt.lessonId\n      ? await this.quizAttemptRepository.findQuizByLessonId(attempt.lessonId)\n      : null;',
    content
)
content = re.sub(
    r'if \(quiz\?\.isContest && !isAutoSubmit\) \{',
    r'if (quiz && (!!attempt.contestId || (quiz as any).isContest) && !isAutoSubmit) {',
    content
)
content = re.sub(
    r'metadata: { lessonId: attempt\.lessonId, attemptId },',
    r'metadata: { lessonId: attempt.lessonId, contestId: attempt.contestId, attemptId },',
    content
)

# getAttemptResult
content = re.sub(
    r'const quiz = await this\.quizAttemptRepository\.findQuizByLessonId\(\s*attempt\.lessonId,\s*\);',
    r'const quiz = attempt.contestId\n      ? await this.quizAttemptRepository.findContestById(attempt.contestId)\n      : attempt.lessonId\n      ? await this.quizAttemptRepository.findQuizByLessonId(attempt.lessonId)\n      : null;',
    content
)
content = re.sub(
    r'if \(quiz\?\.isContest\) \{',
    r'if (quiz && (!!attempt.contestId || (quiz as any).isContest)) {',
    content
)

# listAttempts
content = re.sub(
    r'async listAttempts\(\s*lessonId: string,\s*userId: string,\s*\): Promise<AttemptsListResponseDto> \{',
    r'async listAttempts(\n    referenceId: string,\n    userId: string,\n    isContest: boolean = false\n  ): Promise<AttemptsListResponseDto> {',
    content
)
content = re.sub(
    r'const quiz = await this\.quizAttemptRepository\.findQuizByLessonId\(lessonId\);',
    r'if (!isContest) { await this.verifyCourseAccess(userId, referenceId); }\n\n    const quiz = isContest\n      ? await this.quizAttemptRepository.findContestById(referenceId)\n      : await this.quizAttemptRepository.findQuizByLessonId(referenceId);',
    content
)
content = re.sub(
    r'const attempts = await this\.quizAttemptRepository\.findUserAttempts\(\s*lessonId,\s*userId,\s*\);',
    r'const attempts = await this.quizAttemptRepository.findUserAttempts(\n      referenceId,\n      userId,\n      isContest,\n    );',
    content
)
content = re.sub(
    r'const updatedAttempts = await this\.quizAttemptRepository\.findUserAttempts\(\s*lessonId,\s*userId,\s*\);',
    r'const updatedAttempts = await this.quizAttemptRepository.findUserAttempts(\n      referenceId,\n      userId,\n      isContest,\n    );',
    content
)
content = re.sub(
    r'return \{\n\s*lessonId,',
    r'return {\n      lessonId: isContest ? undefined : referenceId,\n      contestId: isContest ? referenceId : undefined,',
    content
)

# getLeaderboard
content = re.sub(
    r'async getLeaderboard\(lessonId: string, userId: string\) \{',
    r'async getLeaderboard(referenceId: string, userId: string, isContest: boolean = false) {',
    content
)
content = re.sub(
    r'await this\.verifyCourseAccess\(userId, lessonId\);',
    r'if (!isContest) await this.verifyCourseAccess(userId, referenceId);',
    content
)
content = re.sub(
    r'const cacheKey = `leaderboard:\$\{lessonId\}`;',
    r'const cacheKey = isContest ? `leaderboard_contest:${referenceId}` : `leaderboard:${referenceId}`;',
    content
)
content = re.sub(
    r'const quiz = await this\.quizAttemptRepository\.findQuizByLessonId\(lessonId\);',
    r'const quiz = isContest\n      ? await this.quizAttemptRepository.findContestById(referenceId)\n      : await this.quizAttemptRepository.findQuizByLessonId(referenceId);',
    content
)
content = re.sub(
    r'if \(!quiz \|\| !quiz\.isContest\) \{',
    r'if (!quiz || (!isContest && !(quiz as any).isContest)) {',
    content
)
content = re.sub(
    r'const attempts = await this\.quizAttemptRepository\.getLeaderboardAttempts\(\s*lessonId,\s*100,\s*\);',
    r'const attempts = await this.quizAttemptRepository.getLeaderboardAttempts(\n      referenceId,\n      100,\n      isContest,\n    );',
    content
)

with open('src/modules/quiz-attempt/quiz-attempt.service.ts', 'w') as f:
    f.write(content)
