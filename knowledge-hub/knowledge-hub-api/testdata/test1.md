
# Test publish


```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
```


```python
data = pd.Series(np.random.randn(1000),index=np.arange(1000))
data.cumsum()
data.plot()
plt.show()
```


![png](publishtest_2_0.png)
