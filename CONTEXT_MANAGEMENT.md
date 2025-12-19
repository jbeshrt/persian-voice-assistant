# 🧠 Context Management - Step-by-Step Information Collection

## 🎯 Problem Statement

When collecting card information step-by-step, the system needs to:
1. Remember what information has been collected
2. Know what to ask for next
3. Understand context-specific responses (e.g., "123" means CVV2 if that's what we're asking for)
4. Confirm previous data when asking for next field
5. Prevent confusion between similar data types (month vs year)

## ✅ Solution Implemented

### State Tracking Variables

```javascript
this.cardCollectionMode = false;      // Are we in card collection mode?
this.cardData = {};                    // Accumulated card data
this.waitingForCardConfirmation = false; // Waiting for user confirmation?
this.currentCardField = null;          // Which field are we currently collecting?
```

### Field States

The `currentCardField` tracks exactly which piece of information we're asking for:
- `'cardNumber'` - Collecting 16-digit card number
- `'cvv2'` - Collecting 3-4 digit security code
- `'expireMonth'` - Collecting expiry month (01-12)
- `'expireYear'` - Collecting expiry year (2 digits)
- `null` - Not actively collecting specific field

## 🔄 Workflow

### 1. Starting Collection

```javascript
startCardCollection() {
    this.cardCollectionMode = true;
    this.cardData = {};
    this.currentCardField = 'cardNumber';
    // Asks: "لطفا شماره کارت ۱۶ رقمی خود را بگویید"
}
```

### 2. Step-by-Step Flow with Context

#### Step 1: Card Number
```
User clicks: "افزودن کارت جدید"
System: "لطفا شماره کارت ۱۶ رقمی خود را بگویید. مثال: ۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"
currentCardField = 'cardNumber'

User says: "۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"
✅ Saved to: cardData.cardNumber = "1234567890123456"
```

#### Step 2: CVV2 (with context reminder)
```
System: "بسیار خوب. شماره کارت **** **** **** 3456 ثبت شد. 
         حالا لطفا سی وی وی دو یا کد امنیتی سه یا چهار رقمی پشت کارت را بگویید"
currentCardField = 'cvv2'

User says: "۱۲۳"
✅ Saved to: cardData.cvv2 = "123"
```

**Key Feature**: System confirms previous data ("شماره کارت ثبت شد") before asking for next field!

#### Step 3: Expire Month (with context)
```
System: "عالی. سی وی وی دو 123 ثبت شد. 
         حالا لطفا ماه انقضای کارت را دو رقمی بگویید. 
         مثال: صفر نه برای ماه سپتامبر یا یک صفر برای ماه اکتبر"
currentCardField = 'expireMonth'

User says: "۰۹"
✅ Saved to: cardData.expireMonth = "09"
```

#### Step 4: Expire Year (with context)
```
System: "خوب. ماه 09 ثبت شد. 
         حالا لطفا سال انقضای کارت را دو رقمی بگویید. 
         مثال: صفر پنج برای سال ۲۰۰۵ یا دو شش برای سال ۲۰۲۶"
currentCardField = 'expireYear'

User says: "۰۵"
✅ Saved to: cardData.expireYear = "05"
```

#### Step 5: Final Confirmation (with all context)
```
System: "اطلاعات کارت شما کامل شد. اجازه بدهید بررسی کنم:
         شماره کارت: **** **** **** 3456,
         کد امنیتی سی وی وی دو: 123,
         تاریخ انقضا: ماه 09 سال 05.
         آیا این اطلاعات را تایید می‌کنید؟ لطفا بله یا خیر بگویید."
currentCardField = null
waitingForCardConfirmation = true

User says: "بله"
✅ Card saved to database
```

## 🧩 Context-Aware Extraction

### All-at-Once Input
```javascript
// User says everything at once
User: "شماره کارت ۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶ سی وی وی دو ۱۲۳ ماه ۰۹ سال ۰۵"

// System extracts all fields at once
cardData = {
    cardNumber: "1234567890123456",
    cvv2: "123",
    expireMonth: "09",
    expireYear: "05"
}
// Skips directly to confirmation
```

### Context-Specific Extraction
```javascript
// When currentCardField = 'cvv2'
User: "۱۲۳"  // Just the number

// extractCardInfo knows we're collecting CVV2
if (this.currentCardField === 'cvv2') {
    const standaloneMatch = cleanText.match(/^(\d{3,4})$/);
    if (standaloneMatch) {
        info.cvv2 = standaloneMatch[1];  // ✅ "123"
    }
}
```

**Without context tracking**: "123" could be month, year, or CVV2 - ambiguous!  
**With context tracking**: "123" is clearly CVV2 because `currentCardField = 'cvv2'`

## 📊 Data Flow Diagram

```
┌─────────────────────────┐
│  User clicks "افزودن"   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ currentCardField =      │
│    'cardNumber'         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Extract from speech     │
│ Based on context        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Save to cardData        │
│ Confirm previous value  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ currentCardField =      │
│    next field or null   │
└───────────┬─────────────┘
            │
            ▼
       Repeat until
       all fields
       collected
            │
            ▼
┌─────────────────────────┐
│ Read all data back      │
│ Request confirmation    │
└───────────┬─────────────┘
            │
         بله│   │خیر
            ▼   ▼
          Save  Cancel
```

## 🔍 Debugging & Logging

Console logs track the extraction process:

```javascript
console.log('Captured card number:', this.cardData.cardNumber);
console.log('Captured CVV2:', this.cardData.cvv2);
console.log('Captured expire month:', this.cardData.expireMonth);
console.log('Captured expire year:', this.cardData.expireYear);
console.log('Extracted all-at-once:', this.cardData);
```

## 🎯 Status Updates

Visual feedback shows current collection state:

```javascript
updateStatus('در انتظار شماره کارت', 'listening');
updateStatus('در انتظار CVV2', 'listening');
updateStatus('در انتظار ماه انقضا', 'listening');
updateStatus('در انتظار سال انقضا', 'listening');
updateStatus('در انتظار تایید', 'listening');
```

## ✨ Key Improvements Over Original

### Before (No Context Management)
```
System: "لطفا شماره کارت بگویید"
User: "۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"

System: "لطفا سی وی وی دو بگویید"  ❌ No confirmation of previous input
User: "۱۲۳"

System: "لطفا ماه انقضا بگویید"  ❌ No context
User: "۹"  ❌ Might fail - ambiguous format
```

### After (With Context Management)
```
System: "لطفا شماره کارت ۱۶ رقمی خود را بگویید. مثال: ۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"
User: "۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"

System: "بسیار خوب. شماره کارت **** **** **** 3456 ثبت شد. ✅ Confirms!
         حالا لطفا سی وی وی دو یا کد امنیتی سه یا چهار رقمی پشت کارت را بگویید"
User: "۱۲۳"

System: "عالی. سی وی وی دو 123 ثبت شد. ✅ Confirms!
         حالا لطفا ماه انقضای کارت را دو رقمی بگویید. 
         مثال: صفر نه برای ماه سپتامبر"
User: "۹"  ✅ Auto-padded to "09" with context awareness
```

## 🛡️ Error Prevention

### Ambiguity Resolution
```javascript
// Without context: "12" could be month or year
// With context when currentCardField = 'expireMonth':
if (month >= 1 && month <= 12) {
    info.expireMonth = month.toString().padStart(2, '0');  // "12"
}

// With context when currentCardField = 'expireYear':
info.expireYear = match[1];  // "12" (year 2012)
```

### Validation by Field Type
- **cardNumber**: Must be exactly 16 digits
- **cvv2**: Must be 3-4 digits
- **expireMonth**: Must be 01-12, auto-padded
- **expireYear**: Must be 2 digits

## 📱 User Experience Benefits

1. **Clear Progress**: User knows exactly what to provide next
2. **Confirmation**: Each step confirms previous data
3. **Examples**: Every prompt includes usage example
4. **Flexibility**: Supports both all-at-once and step-by-step
5. **No Confusion**: Context prevents misinterpretation
6. **Visual Feedback**: Status shows current field being collected

## 🧪 Testing Scenarios

### Scenario 1: Pure Step-by-Step
```
1. Click "افزودن کارت جدید"
2. Say: "۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"
3. Hear confirmation, then say: "۱۲۳"
4. Hear confirmation, then say: "۹"
5. Hear confirmation, then say: "۵"
6. Hear full readback, then say: "بله"
✅ Card saved with context-aware extraction
```

### Scenario 2: Mixed Input
```
1. Click "افزودن کارت جدید"
2. Say: "۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶ سی وی وی دو ۱۲۳"
   (Provides card number AND CVV2)
3. System asks only for month (skips CVV2 question)
4. Say: "۹"
5. Say: "۵"
6. Confirm
✅ Intelligent field skipping based on what's already provided
```

### Scenario 3: All-at-Once
```
1. Click "افزودن کارت جدید"
2. Say: "شماره کارت ۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶ سی وی وی دو ۱۲۳ ماه ۰۹ سال ۰۵"
3. System extracts all fields
4. Skips directly to confirmation
5. Say: "بله"
✅ Efficient one-shot collection
```

## 🔄 State Transitions

```
IDLE
  │
  ├─ Click "افزودن کارت" ──→ COLLECTING (cardNumber)
  │                              │
  │                              ├─ Got cardNumber ──→ COLLECTING (cvv2)
  │                              │                        │
  │                              │                        ├─ Got cvv2 ──→ COLLECTING (expireMonth)
  │                              │                        │                  │
  │                              │                        │                  ├─ Got month ──→ COLLECTING (expireYear)
  │                              │                        │                  │                 │
  │                              │                        │                  │                 └─ Got year ──→ CONFIRMING
  │                              │                        │                  │                                     │
  │                              │                        │                  │                                     ├─ "بله" ──→ SAVING ──→ IDLE
  │                              │                        │                  │                                     │
  │                              │                        │                  │                                     └─ "خیر" ──→ IDLE
  │                              │
  │                              └─ Got all fields ────────────────────────────────────────────────────→ CONFIRMING
```

## 📊 Performance Metrics

- **Context Retention**: 100% (all previous data maintained)
- **Field Tracking**: Explicit state for each field
- **Confirmation Rate**: Every field confirmed before asking next
- **Flexibility**: Supports 1-step to 4-step workflows
- **Error Prevention**: Context eliminates ambiguity

---

**Implementation Date**: December 19, 2025  
**Deployment URL**: https://02855f1a.persian-voice-assistant.pages.dev  
**Git Commit**: 602baf0 - "feat(cards): improve step-by-step collection with explicit context management"

