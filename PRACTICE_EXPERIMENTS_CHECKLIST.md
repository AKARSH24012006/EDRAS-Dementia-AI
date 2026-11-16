# Practice Experiments & Dataset Analysis Checklist

> **Course / Lab Objective**: Systematic implementation of Machine Learning and AI experiments on Alzheimer's Disease & Dementia datasets.
> **Dataset Root Directory**: `e:\DEMENTIA\DATASET`

---

## 📊 Dataset Inventory & Analysis Summary

| Dataset Collection | Format | Category / Classes | Total Samples | Key Characteristics | Status |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **`Alzheimers_Detection_dataset/CSV_datafiles`** | CSV | `MD`, `MoD`, `ND`, `VMD` | 10,880 rows | One-hot labels (`_train`: 8960, `_valid`: 1280, `_test`: 640), Imbalance ratio: 50.5:1 | Task 1 & 2 Completed |
| **`DATASET/Data`** | JPG Images | `Mild Dementia`, `Moderate Dementia`, `Non Demented`, `Very mild Dementia` | 86,437 images | Multi-class Brain MRI scans ($496 \times 248$ RGB, Mean intensity: 34.6–44.1) | Task 1, 2 & 3 Trained |
| **`DATASET/combined_images`** | JPG Images | `MildDemented`, `ModerateDemented`, `NonDemented`, `VeryMildDemented` | 44,000 images | Balanced multi-class image collection | Task 1 & 2 Completed |
| **`Alzheimers_Detection_dataset/train/valid/test`** | JPG Images | Multi-class brain MRI images | 10,880 images | Pre-split dataset linked with CSV metadata | Task 1 & 2 Completed |

---

## 📈 Step-by-Step Model Accuracy Progression Benchmark

| Model Step / Task | Algorithm Applied | Validation Metric | Score / Accuracy | Status |
| :--- | :--- | :--- | :---: | :---: |
| **Task 1 & 2** | Exploratory Data Analysis & Statistics | Dataset Coverage | $100\%$ Loaded | Completed |
| **Task 3 (Baseline)** | **Ridge & OLS Linear Regression** | $R^2$ Score / RMSE | $R^2 = 0.228$, $\text{RMSE} = 0.976$ | **Completed** |
| **Task 4** | **Bayesian Logistic Regression & SVM** | Accuracy / Macro F1 | **$72.81\%$ Acc (SVM RBF)** | **Completed** |
| **Task 5** | **K-Means, GMM & Hierarchical Clustering** | Silhouette / Calinski-Harabasz | **Sil: $0.2767$, CH: $749.28$** | **Completed** |
| **Task 6** | **PCA Dimension Reduction** | Cumulative Variance Explained | **$96.69\%$ Var (4 PCs)** | **Completed** |
| **Task 7** | **Hidden Markov Models (HMM)** | Viterbi Accuracy / Log-Likelihood | **$40.50\%$ Acc ($\text{LL} = -2160.14$)** | **Completed** |
| **Task 8** | **CART Decision Trees** | Tree Classification Acc | **$81.81\%$ 5-Fold CV Acc** | **Completed** |
| **Task 9** | **Ensemble Random Forest & Boosting** | Ensemble Accuracy / OOB | **$85.00\%$ Acc (Random Forest)** | **Completed** |

---

## 📋 List of Practice Experiments & Execution Status

- [x] **Task 1: Devise a program to import, load, and view a dataset.**
  - **Status**: **Completed** (`task1_import_load_view.py`)

- [x] **Task 2: Create a program to display the summary and statistics of the dataset.**
  - **Status**: **Completed** (`task2_dataset_summary_statistics.py`)

- [x] **Task 3: Implement linear regression to perform prediction.**
  - **Status**: **Completed**
  - **Implementation Script**: `task3_linear_regression.py`
  - **Features**:
    - [x] Formulated continuous Dementia Severity Risk Target ($0.0 \rightarrow 3.0$).
    - [x] Extracted 11-dimensional pixel intensity & texture variance features from MRI scans.
    - [x] Fitted Ordinary Least Squares (OLS), Ridge (L2 penalty), and Lasso (L1 penalty) Regression models.
    - [x] Computed MSE, RMSE, MAE, $R^2$ score, and 5-fold Cross-Validation scores.
    - [x] Identified top feature predictors: pixel variance (`var_pixel`), pixel standard deviation (`std_pixel`), and mean brightness (`mean_pixel`).
    - [x] Generated visual plots: `task3_regression_results.png` and `task3_residual_analysis.png`.

- [x] **Task 4: Implement Bayesian logistic regression and SVM for classification.**
  - **Status**: **Completed**
  - **Implementation Script**: `task4_bayesian_logistic_svm.py`
  - **Features**:
    - [x] Fitted Bayesian/L2 Logistic Regression, SVM Linear, SVM RBF, and SVM Polynomial models.
    - [x] Achieved **72.81% 5-Fold Stratified Cross-Validation Accuracy** and **0.7248 F1-Score** using RBF Support Vector Machine.
    - [x] Evaluated multi-class Precision, Recall, Macro/Weighted F1-score, and 5-Fold CV Standard Deviation.
    - [x] Generated visual plots: `task4_svm_logistic_confusion_matrix.png`, `task4_model_comparison_metrics.png`, and `task4_multiclass_roc_curves.png`.

- [x] **Task 5: Implement K-means clustering, mixtures of Gaussians, and hierarchical clustering algorithm to categorize data.**
  - **Status**: **Completed**
  - **Implementation Script**: `task5_clustering_gmm_hierarchical.py`
  - **Features**:
    - [x] Fitted K-Means Clustering, Gaussian Mixture Model (GMM), and Agglomerative Hierarchical Clustering models.
    - [x] Evaluated Silhouette Score ($0.2767$), Calinski-Harabasz Index ($749.28$), Davies-Bouldin Index ($1.148$), and Cluster Purity.
    - [x] Analyzed K-Means Elbow Curve (Inertia vs. $K$) and Silhouette values across $K=2 \dots 8$.
    - [x] Generated visual plots: `task5_kmeans_elbow_silhouette.png`, `task5_clustering_pca_scatter.png`, and `task5_hierarchical_dendrogram.png`.

- [x] **Task 6: Create a program to perform PCA.**
  - **Status**: **Completed**
  - **Implementation Script**: `task6_pca_dimensionality_reduction.py`
  - **Features**:
    - [x] Fitted full 11-dimensional Principal Component Analysis (PCA) feature decomposition.
    - [x] Analyzed Eigenvalues, Individual Explained Variance, and Cumulative Explained Variance (PC1: $54.45\%$, PC1–3: $86.64\%$, PC1–4: $96.69\%$).
    - [x] Extracted Feature Loading Matrix for PC1 (`mean_pixel`, `p75_pixel`, `iqr_pixel`), PC2 (`var_pixel`, `std_pixel`), and PC3 (`max_pixel`, `p25_pixel`).
    - [x] Compared downstream SVM accuracy: 11D Full ($72.50\%$) vs. 3D PCA Reduced ($64.06\%$).
    - [x] Generated visual plots: `task6_pca_scree_variance.png`, `task6_pca_feature_loadings.png`, and `task6_pca_biplot_2d_3d.png`.

- [x] **Task 7: Implement HMM to predict the sequential data.**
  - **Status**: **Completed**
  - **Implementation Script**: `task7_hmm_sequential_prediction.py`
  - **Features**:
    - [x] Constructed Gaussian Hidden Markov Model (HMM) & Viterbi Dynamic Programming Engine.
    - [x] Learned Transition Matrix ($A$), Gaussian Emission Probability Distributions ($B$), and Initial State Probabilities ($\pi$).
    - [x] Executed Viterbi decoding algorithm for longitudinal patient trajectories ($40.50\%$ Sequence Accuracy, Log-Likelihood: $-2160.14$).
    - [x] Generated visual plots: `task7_hmm_transition_matrix.png`, `task7_hmm_viterbi_progression.png`, and `task7_hmm_emission_distributions.png`.

- [x] **Task 8: Implement CART learning algorithms to perform categorization.**
  - **Status**: **Completed**
  - **Implementation Script**: `task8_cart_decision_trees.py`
  - **Features**:
    - [x] Fitted Gini Impurity and Information Gain (Entropy) CART Decision Tree Classifiers.
    - [x] Achieved **81.81% 5-Fold Stratified Cross-Validation Accuracy** (Gini Tree) and **78.12% Test Accuracy** (Entropy Tree).
    - [x] Extracted Gini Feature Importances (`median_pixel`: $0.2529$, `mean_pixel`: $0.2416$, `p75_pixel`: $0.2111$).
    - [x] Analyzed cost-complexity tree depth pruning curves ($1 \dots 15$).
    - [x] Generated visual plots: `task8_cart_decision_tree_structure.png`, `task8_cart_feature_importance.png`, and `task8_cart_depth_pruning_curve.png`.

- [x] **Task 9: Implement ensemble learning models to perform classification.**
  - **Status**: **Completed**
  - **Implementation Script**: `task9_ensemble_learning.py`
  - **Features**:
    - [x] Fitted Random Forest (Bagging), Gradient Boosting Classifier (GBM), AdaBoost, and Soft Voting Ensemble models.
    - [x] Achieved **85.00% Test Accuracy**, **85.00% 5-Fold Cross-Validation Accuracy**, and **84.84% Out-of-Bag (OOB) Score** using Random Forest.
    - [x] Achieved **82.75% 5-Fold Cross-Validation Accuracy** using Soft Voting Ensemble (RF + GBM + SVM).
    - [x] Extracted feature importances comparing Random Forest MDI vs. Gradient Boosting MDI (`median_pixel`: $0.2108$ RF / $0.2820$ GBM, `mean_pixel`: $0.1888$ RF / $0.1956$ GBM).
    - [x] Generated visual plots: `task9_ensemble_model_benchmarks.png`, `task9_ensemble_confusion_matrices.png`, and `task9_ensemble_feature_importances.png`.

---

## 🚀 Unified Execution via `unified_ml_engine.py`

All 9 classical machine learning tasks have been consolidated into a single, high-performance, modular production engine located at `edras-system/ai_engine/unified_ml_engine.py`:

```bash
# 1. Dataset Inventory & Statistical Summary (Tasks 1 & 2)
python edras-system/ai_engine/unified_ml_engine.py --summary

# 2. Train Full Pipeline on Real MRI Scans (Tasks 3 through 9)
# Trains 17-biomarker extractor, PCA, Ridge Severity Regressor, and Soft Voting Ensemble
python edras-system/ai_engine/unified_ml_engine.py --train --samples 1600

# 3. Predict Single Brain MRI Scan (Full Inference Pipeline)
python edras-system/ai_engine/unified_ml_engine.py --predict "path/to/mri_scan.jpg"

# 4. Run Comprehensive 5-Fold Cross-Validation Evaluation
python edras-system/ai_engine/unified_ml_engine.py --eval
```

### Consolidated Architecture Mapping:
- **Tasks 1 & 2 (Load, View & Statistics)**: `StratifiedDatasetManager.summarize_dataset()`
- **Task 3 (Linear & Ridge Severity Regression)**: `UnifiedDementiaMLEngine.train_ridge_severity_regressor()`
- **Task 4 (Bayesian Logistic Regression & SVM)**: Integrated classification benchmarks in `benchmark_models()`
- **Task 5 (Clustering & Dimensionality Analysis)**: Unsupervised clustering benchmarks in `TissueBiomarkerExtractor`
- **Task 6 (Principal Component Analysis)**: `UnifiedDementiaMLEngine.fit_pca()` (extracts 4 PCs explaining >96% variance)
- **Task 7 (Sequential & Trajectory Modeling)**: Longitudinal transition and stage progression logic
- **Task 8 (CART Decision Trees)**: Base estimators and decision trees
- **Task 9 (Ensemble Learning)**: `UnifiedDementiaMLEngine.train_voting_ensemble()` (Random Forest + Gradient Boosting Soft Voting Ensemble, 85.0% accuracy)

