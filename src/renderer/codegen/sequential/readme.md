## The Sequential Generator

The sequential generator is the **most critical code generation section of Vemto**. Vemto 1.x is entirely based on sequential code generation. In the case of Vemto 2+, the sequential generator is not the only one, but it is still the most important one.

> Before implementing the sequential generator in Vemto 2, code generation was done in real-time, according to changes in each entity. 

For example, when creating or editing a model, it synchronized its code and sent it to the generation queue (through the RenderableFile entity). However, over time, it was realized that the sequential generation architecture (already present in Vemto 1.x) was much better for several reasons:

1. The entire generation is monolithic and centralized, which reduces complexity (on the contrary, the real-time architecture creates several complexity nodes, causing bugs and a tremendous mental effort to understand its decentralized operation)
2. Enables the creation of specific code generation hooks (facilitating the creation of plugins)
3. It makes it possible to generate the code only when the user wants it, avoiding code generation while the user is experimenting with the Vemto parameters
4. It also allows emulating real-time code generation through a timer combined with a debounce, for example (something that can easily be enabled or disabled by the user)
5. It makes it easier to know which files should be deleted or renamed
6. Generates only the code of the entities registered in the bank. In the case of the real-time architecture, you need to delete the RenderableFile if the related entity is deleted. This is unnecessary in sequential architecture, as the system will scan all the data before compiling the templates.

> The only disadvantage of the sequential architecture is its performance. As it scans all the data, it is slower than the real-time architecture, which only generates the file that was just created or modified. However, the performance impact is not that big, and we can use techniques like hash checking, etc., to generate only files that have been modified.

It is also possible to register the modules that have been modified and trigger the sequential generation of only those modules (since each module has a service responsible for generating the code)