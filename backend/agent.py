from prompts import get_system_prompt, get_followup_instruction
import json
import re


class InterviewAgent:
    def __init__(self, role: str, level: str, stack: str, language: str):
        self.role = role
        self.level = level
        self.stack = stack
        self.language = language
        self.history = []
        self.current_question = 0
        self.total_questions = 6
        self.finished = False
        self.scores = []  # internal per-question score tracking
        self.system_prompt = get_system_prompt(role, level, stack, self.total_questions, language)

    async def start(self, client) -> tuple[str, list]:
        self.history = []
        self.current_question = 1

        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": "Start the interview with question 1. Return JSON."}
            ]
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        reply = data.get("reply", "")
        options = data.get("options", [])
        
        history_content = reply
        if options:
            history_content += "\nOptions:\n" + "\n".join([f"- {opt}" for opt in options])
        
        self.history.append({"role": "assistant", "content": history_content})
        return reply, options

    async def respond(self, client, user_message: str) -> tuple[str, list, bool]:
        self.history.append({"role": "user", "content": user_message})

        # Build scoring instruction for this answer
        score_instruction = get_followup_instruction(
            self.current_question,
            self.total_questions,
            self.level
        )

        messages = [
            {"role": "system", "content": self.system_prompt + "\n\n" + score_instruction},
            *self.history
        ]

        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={ "type": "json_object" },
            messages=messages
        )

        content = response.choices[0].message.content
        data = json.loads(content)
        reply = data.get("reply", "")
        options = data.get("options", [])
        
        history_content = reply
        if options:
            history_content += "\nOptions:\n" + "\n".join([f"- {opt}" for opt in options])

        self.history.append({"role": "assistant", "content": history_content})

        self.current_question += 1
        finished = self.current_question > self.total_questions

        if finished:
            self.finished = True

        return reply, options, finished
