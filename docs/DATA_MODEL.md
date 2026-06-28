# Kos Map - Data Model

## Overview

Kos Map is centered around four core business entities:

* BoardingHouse
* Room
* Tenant
* Contract

A **Contract** is the source of truth connecting a Room and a Tenant.

A Room should never store tenant information directly.

A Tenant should never store current room information directly.

---

# BoardingHouse

Represents the boarding house itself.

Fields

* id
* name
* type
* contactPhone
* address

Type

* MALE
* FEMALE
* MIXED

Description

This entity contains information about the boarding house and will later be extended with:

* Gallery
* Rules
* Google Maps location
* Social media
* Owner information

---

# Room

Represents a physical room inside the boarding house.

Fields

* id
* name
* floorId
* status
* monthlyPrice
* capacity
* occupancyPolicy
* notes

Status

* VACANT
* OCCUPIED
* MAINTENANCE

Occupancy Policy

* SINGLE
* COUPLE
* FAMILY

Description

Room only stores room information.

Room does NOT store tenant information.

Room occupancy is determined from the ACTIVE Contract.

---

# Tenant

Represents a person renting a room.

Fields

* id
* name
* gender
* phone
* occupation
* emergencyContact
* notes

Gender

* MALE
* FEMALE

Description

Tenant represents a person.

A tenant may have multiple contracts over time.

---

# Contract

Represents a rental agreement between a Room and a Tenant.

Fields

* id
* roomId
* tenantId
* createdAt
* startDate
* endDate
* monthlyRent
* deposit
* status
* notes

Status

* ACTIVE
* FINISHED
* CANCELLED

Description

Contract is the business core of the application.

Every occupancy history is stored as a Contract.

Revenue is calculated from Contracts.

---

# Relationships

BoardingHouse

1 ---- * Room

Room

1 ---- * Contract

Tenant

1 ---- * Contract

Meaning

* One boarding house contains many rooms.
* One room can have many contracts over time.
* One tenant can have many contracts over time.

---

# Source of Truth

Current Tenant

Do NOT store currentTenant inside Room.

Instead,

Current Tenant is the Tenant attached to the ACTIVE Contract.

Room status should be derived from ACTIVE Contract whenever possible.

---

# Revenue

Revenue is calculated from Contracts.

Formula

monthlyRent × contract duration

Payment tracking is intentionally out of scope for Version 1.

---

# Design Principles

* Avoid duplicated data.
* Contract is the source of truth.
* Prefer derived data instead of duplicated fields.
* Keep entities independent.
* Build for future scalability while keeping Version 1 simple.

---

# Out of Scope (Version 1)

The following features are intentionally excluded.

## Boarding House

* Gallery
* Rules
* Google Maps
* Social Media
* Owner Profile

## Tenant

* Photo
* Identity document upload
* Multiple phone numbers

## Finance

* Payment history
* Invoice
* Late fee
* Utility bills
* Discounts

## Booking

* Online booking
* Availability calendar
* Reservation

## Occupancy

* Multiple occupants per room
* Family member records
* Visitor management

These features may be introduced in future versions without changing the core architecture.
