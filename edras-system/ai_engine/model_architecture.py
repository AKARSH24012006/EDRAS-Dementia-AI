import torch
import torch.nn as nn
import torch.nn.functional as F

class AcousticFeatureExtractor(nn.Module):
    """
    1D-CNN + Bi-LSTM for sequence modeling of eGeMAPS/MFCC acoustic embeddings over time.
    """
    def __init__(self, input_dim=88, hidden_dim=64, num_layers=2):
        super(AcousticFeatureExtractor, self).__init__()
        self.conv1 = nn.Conv1d(in_channels=input_dim, out_channels=64, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm1d(64)
        self.conv2 = nn.Conv1d(in_channels=64, out_channels=128, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm1d(128)
        
        self.bilstm = nn.LSTM(
            input_size=128,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.2
        )
        self.fc_out = nn.Linear(hidden_dim * 2, 128)

    def forward(self, x):
        # x shape: (batch_size, sequence_length, feature_dim)
        x = x.transpose(1, 2) # (batch_size, feature_dim, sequence_length)
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        x = x.transpose(1, 2) # (batch_size, sequence_length, 128)
        
        lstm_out, (h_n, c_n) = self.bilstm(x)
        # Take mean pooling over sequence length
        pooled = torch.mean(lstm_out, dim=1)
        audio_embedding = F.relu(self.fc_out(pooled))
        return audio_embedding

class LinguisticFeatureEncoder(nn.Module):
    """
    Simulated Transformer / RoBERTa contextual embedding compression layer.
    Transforms 768-dim Transformer output to 128-dim dense linguistic embedding.
    """
    def __init__(self, input_dim=768, hidden_dim=256, output_dim=128):
        super(LinguisticFeatureEncoder, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.dropout = nn.Dropout(0.3)
        self.fc2 = nn.Linear(hidden_dim, output_dim)

    def forward(self, text_embedding):
        x = F.relu(self.fc1(text_embedding))
        x = self.dropout(x)
        out = F.relu(self.fc2(x))
        return out

class MultimodalDementiaFusionClassifier(nn.Module):
    """
    Late Fusion Architecture concatenating Acoustic, Linguistic, and Cognitive Test vectors.
    """
    def __init__(self, num_classes=3):
        super(MultimodalDementiaFusionClassifier, self).__init__()
        self.acoustic_net = AcousticFeatureExtractor(input_dim=88, hidden_dim=64)
        self.linguistic_net = LinguisticFeatureEncoder(input_dim=768, output_dim=128)
        
        # Cognitive vector dimension: 10 (MMSE sub-scores, age, education)
        self.cognitive_fc = nn.Linear(10, 32)
        
        # Fusion dim: 128 (Audio) + 128 (Text) + 32 (Cognitive) = 288
        self.fusion_fc1 = nn.Linear(288, 128)
        self.dropout = nn.Dropout(0.3)
        self.fusion_fc2 = nn.Linear(128, 64)
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, audio_seq, text_embed, cognitive_vec):
        audio_emb = self.acoustic_net(audio_seq)
        text_emb = self.linguistic_net(text_embed)
        cog_emb = F.relu(self.cognitive_fc(cognitive_vec))
        
        joint_vector = torch.cat((audio_emb, text_emb, cog_emb), dim=1)
        
        x = F.relu(self.fusion_fc1(joint_vector))
        x = self.dropout(x)
        x = F.relu(self.fusion_fc2(x))
        logits = self.classifier(x)
        
        probabilities = F.softmax(logits, dim=1)
        return logits, probabilities
