# AI Prompt Quick Reference Guide
*Sally, UX Expert | BMad-Method Framework*

## 🚀 **SPRINT-ALIGNED PROMPT USAGE**

### **Sprint 2 (Weeks 3-4): Foundation**
- ✅ **Prompt 4** - Mobile-First Navigation → Use for Story 2 (Frontend Foundation)

### **Sprint 3 (Weeks 5-6): Dashboard UI** 
- ✅ **Prompt 1** - NotebookCard Component → Use for Story 4 (Dashboard UI)
- ✅ **Prompt 2** - NotebookGrid Layout → Use for Story 4 (Dashboard UI)

### **Sprint 4 (Weeks 7-8): Task Views**
- ✅ **Prompt 3** - Task Kanban Board → Use for Story 6 (Task Views)

### **Future Enhancements:**
- ✅ **Prompt 5** - Smart Search Overlay → Post-MVP feature

---

## 📱 **MOBILE-FIRST DEVELOPMENT ORDER:**

1. **Start Here:** Navigation (Prompt 4)
   - Establishes app structure and routing foundation
   - Mobile bottom tabs + desktop sidebar

2. **Build Core:** NotebookCard (Prompt 1) 
   - Foundation component for all notebook displays
   - Beautiful animations and thoughtkeeper styling

3. **Add Layout:** NotebookGrid (Prompt 2)
   - Responsive grid system for notebook display
   - Uses NotebookCard component

4. **Advanced Views:** Kanban Board (Prompt 3)
   - Complex drag-and-drop functionality
   - Multi-column task management

5. **Enhancement:** Search Overlay (Prompt 5)
   - Global search with keyboard shortcuts
   - Advanced user interaction patterns

---

## 🎯 **AI TOOL RECOMMENDATIONS:**

### **For v0.dev:**
- Perfect for: Prompts 1, 2, 4 (component-focused)
- Strength: Clean React + TailwindCSS generation
- Best Practice: One component at a time

### **For Cursor:**
- Perfect for: All prompts, especially 3, 5 (complex logic)
- Strength: Integration with existing codebase
- Best Practice: Use with existing project context

### **For Lovable.ai:**
- Perfect for: Prompts 1, 2, 3 (full app sections)  
- Strength: Complete feature implementation
- Best Practice: Describe full user workflows

---

## ⚡ **QUICK COPY-PASTE CHECKLIST:**

Before pasting any prompt:
- [ ] Choose your AI tool (v0, Cursor, Lovable, etc.)
- [ ] Read the entire prompt to understand scope
- [ ] Have your project setup ready (React + TypeScript + TailwindCSS)
- [ ] Copy from "HIGH-LEVEL GOAL" to "STRICT SCOPE"
- [ ] Paste and generate
- [ ] Review output carefully for quality and accessibility

After generation:
- [ ] Test component in isolation
- [ ] Verify responsive behavior (mobile → desktop)
- [ ] Check accessibility (screen reader, keyboard nav)
- [ ] Test animations and interactions
- [ ] Integrate with your existing codebase
- [ ] Add proper error handling

---

## 🎨 **DESIGN TOKENS REFERENCE:**

### **Colors (Notebook Categories):**
```css
Work: #3B82F6 (blue-500)
Personal: #10B981 (emerald-500)
Hustles: #F59E0B (amber-500)  
Health: #EF4444 (red-500)
Ideas: #8B5CF6 (violet-500)
```

### **Priority Colors:**
```css
High: border-red-500
Medium: border-amber-500
Low: border-green-500  
```

### **Spacing Scale:**
```css
Mobile: gap-4 (16px)
Desktop: gap-6 (24px)
Cards: p-4 (16px) mobile, p-6 (24px) desktop
```

### **Animation Durations:**
```css
Micro: 150ms (hover states)
Standard: 300ms (transitions)
Complex: 500ms (page transitions)
```

---

## 🔧 **TROUBLESHOOTING:**

### **Common AI Generation Issues:**

**❌ Generic Styling:**
- Solution: Emphasize "thoughtkeeper-inspired design" in prompts
- Add specific color palette and animation examples

**❌ Missing TypeScript:**
- Solution: Explicitly mention "TypeScript interface" in prompts
- Include type definitions in CODE EXAMPLES section

**❌ Poor Mobile Responsiveness:**
- Solution: Emphasize "mobile-first" approach
- Include specific Tailwind responsive classes

**❌ Accessibility Issues:**
- Solution: Add "ARIA labels, keyboard navigation" to instructions
- Test generated components with screen readers

### **Quality Assurance:**
Always test generated components for:
- ✅ **Visual consistency** with design system
- ✅ **Responsive behavior** across breakpoints  
- ✅ **Accessibility compliance** (WCAG guidelines)
- ✅ **Performance** (smooth animations, no jank)
- ✅ **Error handling** (loading states, empty states)

---

## 📞 **NEED HELP?**

If AI-generated components don't match expectations:
1. **Iterate with follow-up prompts** - be specific about changes needed
2. **Combine AI output with manual refinement** - perfect the details
3. **Test thoroughly** - AI can miss edge cases and accessibility concerns
4. **Refer back to thoughtkeeper examples** - maintain design consistency

**Remember: AI accelerates development, but human review ensures quality!** ✨
