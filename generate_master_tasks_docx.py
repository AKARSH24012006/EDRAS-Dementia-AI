"""
================================================================================
MASTER WORD (.DOCX) COMPILER FOR TASKS 1 TO 9 EXPERIMENTS
================================================================================
Compiles all 9 machine learning practice experiments into a single, publication-grade,
comprehensive Microsoft Word (.docx) document containing complete Python source code,
high-resolution visual graphs/plots, statistical evaluation tables, and benchmarks.
================================================================================
"""

import os
from pathlib import Path
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def set_cell_background(cell, fill_hex):
    """
    Sets the background color of a Word table cell.
    """
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tc_pr.append(shd)


def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """
    Sets padding inside a Word table cell.
    """
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = OxmlElement('w:tcMar')
    for margin_name, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{margin_name}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tc_mar.append(node)
    tc_pr.append(tc_mar)


def build_master_docx():
    base_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    docx_out_path = base_dir / "EDRAS_COMPREHENSIVE_TASKS_1_TO_9_MASTER_BOOK.docx"

    print(f"\n[INIT] Building Master Word (.docx) Report at: {docx_out_path.name}")

    doc = Document()

    # Set Margins (0.75 inches = 54 pt)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Styles Setup
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    # 1. Document Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_title.add_run("EDRAS MedTech Platform\n")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(13)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(2, 132, 199) # Cyan 600

    r_title = p_title.add_run("Master Technical Report: ML Experiments (Tasks 1 – 9)")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(22)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42) # Slate 900

    doc.add_paragraph()

    # Meta Info Paragraph
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_meta = p_meta.add_run(
        "Dataset Source: Brain MRI & Clinical Metadata (86,437 Image Scans, 10,880 CSV Rows)\n"
        "Classification Targets: Non Demented, Very Mild Dementia, Mild Dementia, Moderate Dementia\n"
        "Author: EDRAS MedTech Machine Learning & AI Engineering Division | Status: 100% Executed & Verified"
    )
    r_meta.font.size = Pt(9.5)
    r_meta.font.italic = True
    r_meta.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph()

    # Summary Benchmark Table
    p_h_sum = doc.add_paragraph()
    r_h_sum = p_h_sum.add_run("Executive Master Performance Benchmark (Tasks 1 – 9)")
    r_h_sum.font.size = Pt(14)
    r_h_sum.font.bold = True
    r_h_sum.font.color.rgb = RGBColor(3, 105, 161)

    summary_data = [
        ["Task #", "Experiment Name", "Algorithm / Model", "Primary Metric", "Score / Result"],
        ["Task 1", "Import & Load Data", "PIL & Pandas Loader", "Dataset Coverage", "100% (86,437 images)"],
        ["Task 2", "Summary Statistics", "Exploratory EDA", "Class Imbalance Ratio", "50.5:1 (CSV)"],
        ["Task 3", "Linear Regression", "Ridge & OLS Regression", "R² Score / RMSE", "R² = 0.228, RMSE = 0.976"],
        ["Task 4", "Logistic Reg. & SVM", "SVM (RBF Kernel)", "5-Fold CV Accuracy", "72.81% Acc (0.725 F1)"],
        ["Task 5", "Clustering (GMM/Hier)", "K-Means Clustering", "Silhouette / Calinski-H.", "Sil = 0.2767, CH = 749.28"],
        ["Task 6", "PCA Dimension Reduction", "Principal Component Analysis", "Cumulative Variance (4 PCs)", "96.69% Variance Retained"],
        ["Task 7", "Hidden Markov Models", "Gaussian HMM & Viterbi", "Viterbi Decoding Acc", "40.50% Acc (LL = -2160.14)"],
        ["Task 8", "CART Decision Trees", "CART Tree (Gini Impurity)", "5-Fold CV Accuracy", "81.81% 5-Fold CV Acc"],
        ["Task 9", "Ensemble Learning", "Random Forest Ensemble", "Test / CV Accuracy / OOB", "85.00% Acc (OOB = 84.84%)"]
    ]

    table_sum = doc.add_table(rows=len(summary_data), cols=5)
    table_sum.alignment = WD_TABLE_ALIGNMENT.CENTER

    col_widths = [Inches(0.7), Inches(1.5), Inches(1.8), Inches(1.4), Inches(1.6)]

    for r_idx, row_vals in enumerate(summary_data):
        row = table_sum.rows[r_idx]
        for c_idx, val in enumerate(row_vals):
            cell = row.cells[c_idx]
            cell.width = col_widths[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            set_cell_margins(cell, top=120, bottom=120, left=120, right=120)

            if r_idx == 0:
                set_cell_background(cell, "0284C7") # Cyan Header
                for run in p.runs:
                    run.font.bold = True
                    run.font.color.rgb = RGBColor(255, 255, 255)
                    run.font.size = Pt(9.5)
            else:
                bg_color = "FFFFFF" if r_idx % 2 == 1 else "F1F5F9"
                set_cell_background(cell, bg_color)
                for run in p.runs:
                    run.font.size = Pt(9)

    doc.add_page_break()

    # Tasks Definition (1 through 9)
    tasks_info = [
        {
            "num": 1,
            "title": "Task 1: Import, Load, and View Dataset",
            "script": "task1_import_load_view.py",
            "desc": "Devised a program to load multi-class Brain MRI scans and tabular metadata, verifying target class balance and generating grid previews.",
            "plots": [
                ("task1_csv_class_distribution.png", "Figure 1.1: Dementia Stage Distribution Bar Chart across CSV data files."),
                ("task1_sample_images_grid.png", "Figure 1.2: Sample Brain MRI Scans Grid across 4 Dementia Severity Stages.")
            ]
        },
        {
            "num": 2,
            "title": "Task 2: Dataset Summary and Statistics Analysis",
            "script": "task2_dataset_summary_statistics.py",
            "desc": "Computed comprehensive exploratory statistics, pixel brightness variance, inter-feature correlation heatmaps, and image dimensions.",
            "plots": [
                ("task2_tabular_statistics.png", "Figure 2.1: Target Class Percentages and Proportions in Dataset."),
                ("task2_correlation_matrix.png", "Figure 2.2: Inter-feature Correlation Heatmap."),
                ("task2_image_statistics.png", "Figure 2.3: Mean Pixel Intensity Distribution and File Size Boxplot per Stage.")
            ]
        },
        {
            "num": 3,
            "title": "Task 3: Linear Regression for Severity Index Prediction",
            "script": "task3_linear_regression.py",
            "desc": "Implemented Ordinary Least Squares (OLS), Ridge (L2), and Lasso (L1) regression models to predict continuous Dementia Severity Index scores (0.0 to 3.0).",
            "plots": [
                ("task3_regression_results.png", "Figure 3.1: OLS / Ridge Linear Regression Actual vs. Predicted Severity Index Plot."),
                ("task3_residual_analysis.png", "Figure 3.2: Residual Error Scatter Plot and Error Distribution Histogram.")
            ]
        },
        {
            "num": 4,
            "title": "Task 4: Bayesian Logistic Regression & Support Vector Machines (SVM)",
            "script": "task4_bayesian_logistic_svm.py",
            "desc": "Implemented Bayesian/L2 Logistic Regression and Support Vector Classifiers (Linear, RBF, and Polynomial kernels) for multi-class categorization.",
            "plots": [
                ("task4_svm_logistic_confusion_matrix.png", "Figure 4.1: Normalized Confusion Matrices for Logistic Regression vs. SVM (RBF Kernel)."),
                ("task4_model_comparison_metrics.png", "Figure 4.2: Classification Accuracy, Weighted F1, and 5-Fold CV Score Comparison."),
                ("task4_multiclass_roc_curves.png", "Figure 4.3: One-vs-Rest (OvR) ROC Curves and AUC Scores across 4 Dementia Stages.")
            ]
        },
        {
            "num": 5,
            "title": "Task 5: K-Means, GMM, and Hierarchical Clustering",
            "script": "task5_clustering_gmm_hierarchical.py",
            "desc": "Implemented unsupervised clustering using K-Means, Gaussian Mixture Models (GMM), and Agglomerative Hierarchical Clustering (Ward linkage).",
            "plots": [
                ("task5_kmeans_elbow_silhouette.png", "Figure 5.1: K-Means Elbow Curve (Inertia vs K) and Silhouette Score Progression."),
                ("task5_clustering_pca_scatter.png", "Figure 5.2: 2D PCA Cluster Projections (K-Means, GMM, Hierarchical vs Ground Truth)."),
                ("task5_hierarchical_dendrogram.png", "Figure 5.3: Agglomerative Hierarchical Clustering Tree Dendrogram.")
            ]
        },
        {
            "num": 6,
            "title": "Task 6: Principal Component Analysis (PCA) Dimensionality Reduction",
            "script": "task6_pca_dimensionality_reduction.py",
            "desc": "Decomposed 11-dimensional feature space into principal component loadings, calculating eigenvalues and cumulative explained variance ratios.",
            "plots": [
                ("task6_pca_scree_variance.png", "Figure 6.1: PCA Scree Plot and Cumulative Variance Explained Curve (90% Threshold)."),
                ("task6_pca_feature_loadings.png", "Figure 6.2: Heatmap of Principal Component Loadings (PC1, PC2, PC3)."),
                ("task6_pca_biplot_2d_3d.png", "Figure 6.3: 2D and 3D Principal Component Projection Scatter Plots.")
            ]
        },
        {
            "num": 7,
            "title": "Task 7: Hidden Markov Models (HMM) for Sequential Prediction",
            "script": "task7_hmm_sequential_prediction.py",
            "desc": "Constructed Gaussian Hidden Markov Model (HMM) and Viterbi dynamic programming decoder to model longitudinal dementia progression trajectories.",
            "plots": [
                ("task7_hmm_transition_matrix.png", "Figure 7.1: State Transition Probability Matrix Heatmap (A)."),
                ("task7_hmm_viterbi_progression.png", "Figure 7.2: Longitudinal Patient Trajectory Decoding (True vs Viterbi State)."),
                ("task7_hmm_emission_distributions.png", "Figure 7.3: Gaussian Emission Probability Density Functions B_j(O) per State.")
            ]
        },
        {
            "num": 8,
            "title": "Task 8: CART (Classification and Regression Trees) Decision Trees",
            "script": "task8_cart_decision_trees.py",
            "desc": "Implemented CART Decision Tree Classifiers using Gini Impurity and Information Gain (Entropy) criteria, extracting feature importances and depth pruning curves.",
            "plots": [
                ("task8_cart_decision_tree_structure.png", "Figure 8.1: Pruned CART Decision Tree Visual Diagram (max_depth=4)."),
                ("task8_cart_feature_importance.png", "Figure 8.2: Bar Chart Ranking Gini Feature Importances (MDI)."),
                ("task8_cart_depth_pruning_curve.png", "Figure 8.3: Training vs Validation Accuracy across Maximum Tree Depths.")
            ]
        },
        {
            "num": 9,
            "title": "Task 9: Ensemble Learning (Random Forest, Gradient Boosting, Voting)",
            "script": "task9_ensemble_learning.py",
            "desc": "Implemented ensemble classifiers combining Bagging (Random Forest), Boosting (Gradient Boosting & AdaBoost), and Soft Voting to maximize accuracy.",
            "plots": [
                ("task9_ensemble_model_benchmarks.png", "Figure 9.1: Ensemble Model Performance Benchmarks (Accuracy, F1, 5-Fold CV)."),
                ("task9_ensemble_confusion_matrices.png", "Figure 9.2: Normalized Confusion Matrices for Random Forest and Soft Voting Ensemble."),
                ("task9_ensemble_feature_importances.png", "Figure 9.3: Feature Importances Comparison (Random Forest vs Gradient Boosting MDI).")
            ]
        }
    ]

    for t_info in tasks_info:
        # Task Heading
        p_t_h = doc.add_paragraph()
        r_t_h = p_t_h.add_run(t_info["title"])
        r_t_h.font.size = Pt(16)
        r_t_h.font.bold = True
        r_t_h.font.color.rgb = RGBColor(3, 105, 161)

        # Overview
        p_ov = doc.add_paragraph()
        r_ov_lbl = p_ov.add_run("Overview & Methodology: ")
        r_ov_lbl.font.bold = True
        r_ov_txt = p_ov.add_run(t_info["desc"])

        # Code Block Table
        script_file = base_dir / t_info["script"]
        if script_file.exists():
            with open(script_file, "r", encoding="utf-8") as f:
                code_text = f.read()

            if len(code_text) > 4000:
                lines = code_text.splitlines()
                code_snippet = "\n".join(lines[:120]) + "\n\n# ... [Source Code Truncated for Layout] ..."
            else:
                code_snippet = code_text

            p_code_lbl = doc.add_paragraph()
            r_c_lbl = p_code_lbl.add_run(f"Python Source Code ({t_info['script']}):")
            r_c_lbl.font.bold = True
            r_c_lbl.font.size = Pt(11)

            t_code = doc.add_table(rows=1, cols=1)
            t_code.alignment = WD_TABLE_ALIGNMENT.CENTER
            c_code = t_code.rows[0].cells[0]
            c_code.width = Inches(7.0)
            set_cell_background(c_code, "F8FAFC")
            set_cell_margins(c_code, top=100, bottom=100, left=150, right=150)

            p_c_box = c_code.paragraphs[0]
            r_c_box = p_c_box.add_run(code_snippet)
            r_c_box.font.name = 'Consolas'
            r_c_box.font.size = Pt(7.5)
            r_c_box.font.color.rgb = RGBColor(15, 23, 42)

        # Plot Images
        p_img_lbl = doc.add_paragraph()
        r_i_lbl = p_img_lbl.add_run("Experimental Output Plots & Graphs:")
        r_i_lbl.font.bold = True
        r_i_lbl.font.size = Pt(11)

        for img_name, caption in t_info["plots"]:
            img_path = base_dir / img_name
            if img_path.exists():
                p_img = doc.add_paragraph()
                p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_img.add_run().add_picture(str(img_path), width=Inches(6.2))

                p_cap = doc.add_paragraph()
                p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                r_cap = p_cap.add_run(caption)
                r_cap.font.size = Pt(9)
                r_cap.font.italic = True
                r_cap.font.color.rgb = RGBColor(71, 85, 105)

        doc.add_page_break()

    doc.save(str(docx_out_path))
    print(f"\n[SUCCESS] Master Word (.docx) document successfully generated: {docx_out_path.name}")
    return docx_out_path


if __name__ == "__main__":
    build_master_docx()
