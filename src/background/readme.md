## The background process

The background process is a hidden window that runs code generation (sequential generator) and other specific tasks.

This process is necessary because delegating these tasks to the main process makes development difficult. In addition to having to restart the entire application whenever any modification is made, the main process makes it difficult to share the logic with the renderer due to how communication is done through the preloader. For example, if a service uses a preloader method, it will not work in the main process correctly.