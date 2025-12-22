![Status](https://img.shields.io/badge/Status-Under%20Construction-yellow)
![Version](https://img.shields.io/badge/Version-1.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Stack](https://img.shields.io/badge/stack-Spring%20Boot%20%7C%20React%20%7C%20PostgreSQL-green)

## Overview
TPF is a structured personal life operating system designed to apply engineering principles to daily management. It aims to optimize executive function challenges (specifically ADHD) not by simplifying life, but by creating a rigorous, data-driven environment that supports analytical decision-making.

This repository hosts the digital implementation of the **Tactical Planning Framework (TPF) v1.0**.

> **Note:** This documentation outlines the system architecture and philosophy. It is not a user manual or a finalized Software Requirements Specification (SRS). The framework is subject to iterative updates.

## Philosophy & Motivation

This project was born from a specific need: **Optimizing an ADHD mind that thrives on complexity rather than simplicity.**

While traditional advice suggests minimizing planning for ADHD, TPF takes the opposite approach: **Hyper-Systematization.** The goal is to externalize memory and logic into a reliable system.

### Key Objectives:
1.  **Analytical Decision Making:** Removing emotional bias from daily choices by relying on a strict algorithmic base.
2.  **Protection Against Manipulation:** Systematizing human profiling (via the Diamond System) to evaluate relationships objectively, serving as a firewall against social manipulation.
3.  **Permanent Lesson Retention:** Ensuring that "Observations" and "Lessons Learned" are never lost, but stored as permanent data points.
4.  **Extreme Efficiency via Automation:** Reducing weekly planning overhead from **3+ hours to ~10 minutes**. The system handles the heavy lifting of task distribution automatically.

## Core Architecture

### 1. Realism Point (RP) Algorithm
A quantitative metric to assess schedule feasibility and prevent burnout.
$$RP = \frac{\text{Total Required Time (RT)}}{\text{Available Free Time}}$$
* **RP < 0.8:** Optimal Load
* **RP > 1.0:** System Overload (Triggers CWA protocols or rescheduling)

### 2. Auto-Distribution Engine ("The Smoothing Logic")
An algorithmic approach that automatically allocates tasks to daily slots to minimize peaks.
* **Time Smoothing:** Applies the formula $Daily Allocation = \frac{RT}{Available Days}$ to spread load evenly.
* **Atomic vs. Divisible:**
    * **Divisible (Default):** Tasks are split into smaller chunks (min. 5 mins) across multiple days.
    * **Atomic:** Tasks marked as "Non-dividable" (e.g., Exams, Meetings) reserve continuous time blocks.

### 3. Graph-Based Dependency System
Unlike linear to-do lists, TPF utilizes an **N-to-N dependency graph**.
* **Complex Blocking:** Task X can be a prerequisite for Task Y and Z simultaneously.
* **Level Agnostic:** Dependencies are independent of Importance Levels (IL). A Level 3 task (e.g., "Buy batteries") can block a Level 1 task (e.g., "Final Exam").

### 4. Impulse Control Pipeline
Implements a "Pre-Preparation" layer. Observations are captured but locked behind a mandatory **2-day buffer period** before they can be processed into actionable tasks or entities.

### 5. The Diamond System
A hierarchical, relational model for managing personal and professional entities based on calculated Evaluation Points (EP).

## Tech Stack

The project utilizes a feature-based architecture with a focus on data integrity and relational mapping.

* **Frontend:** React.js (Vite), Tailwind CSS
* **Backend:** Java Spring Boot (REST API)
* **Database:** PostgreSQL (Recursive Schema for Tasks, Relational for Entities)
* **Caching:** Redis (Planned for RP calculation optimization)
* **Infrastructure:** Docker (Containerization)

## Tech Stack - Light ( [umaykuzeysamli.space](https://www.umaykuzeysamli.space/) )

- Next.js 16
- TypeScript
- Drizzle ORM
- PostgreSQL
- Tailwind CSS
- Postgresql
- node.js
- AWS (sadly)

## Roadmap & Current Status

The project is currently in the **Alpha** development phase. (all done at the light phase [umaykuzeysamli.space](https://www.umaykuzeysamli.space/))

- [x] **Frontend Architecture:** React implementation of Dashboard, Diamond View, and Task Trees.
- [ ] **Database Schema:** PostgreSQL ERD design (Recursive Tasks, Entity Relations).
- [ ] **Backend Logic:** Spring Boot REST API integration.
- [ ] **Algorithm Implementation:** Auto-distribution (Smoothing) & Graph Dependency logic.
- [ ] **Optimization:** Redis caching layer implementation.
- [ ] **Deployment:** Kubernetes/Docker orchestration.

## Installation

_Installation instructions and Docker Compose configurations are coming soon._

## Versioning

Current Version: **v1.0**
This system follows Semantic Versioning. Future updates will introduce advanced features such as Entity Interaction Mapping and Automated CWA Triggers.



<img width="524" height="825" alt="1" src="https://github.com/user-attachments/assets/d25c7eb0-d689-4659-a21c-36c7229d00fa" />
<img width="1899" height="871" alt="4" src="https://github.com/user-attachments/assets/2dd13e00-26d9-4a5f-b131-f5fe548289ff" />
<img width="1603" height="694" alt="3" src="https://github.com/user-attachments/assets/1c3b11c2-0de3-485b-bad8-2323552d1caa" />
<img width="510" height="762" alt="2" src="https://github.com/user-attachments/assets/2a342c9f-f380-446f-98b5-0f7606730bd6" />





