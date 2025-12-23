+++
date = '2025-12-23'
draft = false
title = 'Building Milutin: My AI-Powered Zettelkasten System'
tags = ['Zettelkasten', 'Obsidian', 'Claude Code']
preview_summary = "Walkthrough of why and how I built Milutin"
+++

## The problem

I already had a decent amount of notes in Obsidian. The structure was there and I was using the vault daily.

But as time went on, I was really starting to avoid it.

Not because the notes were not providing value, they were fine. The problem was I felt like it was way too much effort to document everything.

There was too much friction. Writing notes took too much time and cognitive bandwidth. Every time I'd read something interesting or have an idea, I'd think "I should capture this..." and then immediately think "...but that means opening Obsidian, figuring out where it goes, writing it in the right format, linking it to other notes..."

I just didn't want to deal with all that most of the time.

So I went looking for a solution. That's when I found Eugene's Cornelius project.

## Finding the solution

I went on YouTube searching for "Zettelkasten obsidian AI." That's literally what I typed.

Found [Eugene's Cornelius project](https://github.com/Abilityai/cornelius) and watched the [walkthrough video](https://www.youtube.com/watch?v=Jsh_XbUynx0&t=18s).

I was hyped immediately.

The agents. The way everything was set up. This was exactly what I was looking for, AI that could actually help manage a Zettelkasten without intruding on my own ideas and writing.

I knew I wanted to implement it. Not exactly as-is, I needed to adapt it to how I wanted to run my Zettelkasten. But the foundation was definitely there.

## Why I built Milutin

I could have just used Cornelius as-is. But thing is...I like endlessly personalizing and customizing things.

I wanted to mold the whole project to my opinions and workflows. Optimize it for my specific use case. Not "a Zettelkasten system" - MY Zettelkasten system.

So I started adapting it bit by bit.

I picked the name Milutin first (inspired by one of my favorite places to eat in Belgrade - [Milutin](https://xn--h1aaici2ag.xn--90a3ac/)). Then I thought, "wait, if it's called Milutin, it should be Milutin!" So that was that.

I just find it more enjoyable to work with something that has personality. Conversing with Milutin feels better when there's a little character to it.

I value authenticity, originality, uniqueness. And Milutin was doing better than the generic default AI assistant.

## How it works

This isn't some complex technical achievement. It's just some Claude Code configuration.

The setup:

- Claude Code (the CLI tool from Anthropic)
- System prompt files that configure how Claude behaves
- Agents (specialized sub-prompts for specific tasks)
- MCP servers that connect Claude to Obsidian
- Your Obsidian vault

That's basically it.

The concept is: You talk to Claude Code → Claude reads configuration files → Claude can invoke specialized agents → Agents interact with your vault through MCP.

### What I built

I took Eugene's Cornelius setup and adapted everything to me:

- Changed the system prompts to match how I want to work
- Configured agents for my specific workflows
- Added personality
- Made it work with MY Zettelkasten structure

Nothing was particularly hard. After a bit of tinkering, architecture and workflow redesign, testing the agents and molding everything to my tastes - I got it to a point where I feel I'm satisfied enough with the results.

### The voice thing

Because of voice preservation, Milutin writes notes that sound like me. But do keep in mind, a baseline of writing must exist. Nobody can write like you if you never wrote anything, right?

But the reality is I still go over every note, I read it and tweak it if I find it necessary. Going over the notes helps with knowledge retention and keeps everything intentional. I'm not trying to fully automate note-taking. I'm trying to reduce friction and make it easier.

### The brain-switching thing

Eugene made it possible to switch between different vaults with the Cornelius Project. However I do not actually use this feature, it's a nice-to-have for the future if I ever want separate work/personal vaults.

## What I use it for

Milutin is my everyday partner. I can't give you "one specific time" it helped - that's like asking which specific breath kept you alive today.

The main things Milutin helps me with are:

### External information → Zettelkasten notes

This is the main use case. I read something (article, book, video, whatever), talk to Milutin about it, and transform it into Zettelkasten notes in my voice.

That's the core workflow.

The friction is gone. Before, I'd read something interesting and think "ugh, I should note this down but it's too much work." Now I just chat with Milutin and notes get created.

### Writing based on my notes

I use my Zettelkasten notes for writing - same as Luhmann (the guy who invented Zettelkasten). Milutin helps synthesize notes into articles, posts, whatever I'm writing.

### The Agents

All the agents have their use case. They're all essential for how the system functions:

- **vault-manager**: Creating and organizing notes
- **insight-extractor**: Processing external content
- **connection-finder**: Finding relationships between notes
- **auto-discovery**: Background pattern mining
- **diagram-generator**: Designing diagrams based on notes

### Has it solved the problem?

It's safe to say it has.

The friction is gone. I'm heavily using my Zettelkasten now. The only limit is Claude Code's token usage :).

## Why I'm sharing this

I built this, and it works for me, maybe it'll work for you too.

That's it. I just want to share it in case someone finds it useful.

### What you should do with it

Fork it. Clone it. Rip it apart. Extract whatever value you can from Milutin.

If the whole thing works for you - great, use it.

If parts of it are useful - take those parts.

If it just gives you ideas for building your own AI Zettelkasten management system - even better.

### What I would suggest

Try it out. Or use it as inspiration to build your own version.

If you're struggling with the same friction I had (manual Zettelkasten being exhausting), this might solve it. If you want AI to help manage your knowledge base, this is one way to do it.

The code is here: [https://github.com/markoonakic/milutin](https://github.com/markoonakic/milutin)

Clone it, configure your vault path, start using it. If it works for you, cool. If not, no worries.

## Links & Resources

**Milutin:**

- [GitHub Repository](https://github.com/markoonakic/milutin)
- [Claude Code](https://github.com/anthropics/claude-code)
- [Obsidian](https://obsidian.md/)

**Inspiration:**

- [Original Cornelius Project](https://github.com/Abilityai/cornelius)
- [Cornelius Walkthrough Video](https://www.youtube.com/watch?v=Jsh_XbUynx0&t=18s)
